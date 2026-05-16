#!/usr/bin/env python3
"""
Cross-platform environment preparation for selenium-e2e.

Responsibilities:
1) Ensure Java 23 is available (use JAVA_HOME or project-local .jdk).
2) On Windows, optionally download/extract Temurin JDK 23 into .jdk.
3) Create local truststore from Windows cert stores (Windows only) to fix Maven PKIX.
4) Persist discovered JAVA_HOME in .jdk/jdk.home.
"""
from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
import urllib.request
import zipfile
from pathlib import Path


JDK_MAJOR = "23"
TEMURIN_WINDOWS_ZIP_URL = (
    "https://api.adoptium.net/v3/binary/latest/23/ga/windows/x64/jdk/hotspot/normal/eclipse"
)
TRUSTSTORE_PASSWORD = "changeit"


def log(msg: str) -> None:
    print(f"[prepare_env.py] {msg}")


def run(cmd: list[str], check: bool = True, capture: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd,
        check=check,
        text=True,
        capture_output=capture,
    )


def java_version_ok(java_exe: Path) -> bool:
    if not java_exe.exists():
        return False
    try:
        cp = run([str(java_exe), "-version"], check=False)
        out = (cp.stdout or "") + (cp.stderr or "")
        return re.search(r'version "23(\.|")', out) is not None
    except Exception:
        return False


def find_java_home_from_marker(marker: Path) -> Path | None:
    if not marker.exists():
        return None
    value = marker.read_text(encoding="utf-8").strip()
    if not value:
        return None
    home = Path(value)
    if java_version_ok(home / "bin" / ("java.exe" if os.name == "nt" else "java")):
        return home
    return None


def find_java_home_from_env() -> Path | None:
    val = os.environ.get("JAVA_HOME", "").strip()
    if not val:
        return None
    home = Path(val)
    java_name = "java.exe" if os.name == "nt" else "java"
    if java_version_ok(home / "bin" / java_name):
        return home
    return None


def find_java_home_from_extract(extract_dir: Path) -> Path | None:
    if not extract_dir.exists():
        return None
    java_name = "java.exe" if os.name == "nt" else "java"
    for child in extract_dir.iterdir():
        if child.is_dir() and java_version_ok(child / "bin" / java_name):
            return child
    return None


def download_file(url: str, target: Path) -> None:
    with urllib.request.urlopen(url) as response, target.open("wb") as f:
        shutil.copyfileobj(response, f)


def ensure_windows_jdk23(project_root: Path, cache_dir: Path, extract_dir: Path) -> Path:
    zip_path = cache_dir / "temurin-jdk-23-windows-x64.zip"
    tmp_zip = cache_dir / "temurin-jdk-23-windows-x64.zip.download"
    cache_dir.mkdir(parents=True, exist_ok=True)

    if not zip_path.exists():
        log("Downloading Temurin JDK 23 for Windows x64...")
        if tmp_zip.exists():
            tmp_zip.unlink()
        download_file(TEMURIN_WINDOWS_ZIP_URL, tmp_zip)
        tmp_zip.replace(zip_path)
    else:
        log(f"Reusing cached archive: {zip_path}")

    if extract_dir.exists():
        shutil.rmtree(extract_dir)
    extract_dir.mkdir(parents=True, exist_ok=True)

    log(f"Extracting JDK archive into: {extract_dir}")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(extract_dir)

    home = find_java_home_from_extract(extract_dir)
    if not home:
        raise RuntimeError(f"Could not locate JDK 23 under {extract_dir}")
    return home


def keytool_path(java_home: Path) -> Path:
    exe = "keytool.exe" if os.name == "nt" else "keytool"
    return java_home / "bin" / exe


def create_windows_truststore(java_home: Path, truststore_path: Path, password: str) -> None:
    kt = keytool_path(java_home)
    truststore_path.parent.mkdir(parents=True, exist_ok=True)
    if truststore_path.exists():
        truststore_path.unlink()

    # ROOT import
    run(
        [
            str(kt),
            "-importkeystore",
            "-srckeystore",
            "NONE",
            "-srcstoretype",
            "Windows-ROOT",
            "-destkeystore",
            str(truststore_path),
            "-deststoretype",
            "PKCS12",
            "-deststorepass",
            password,
            "-noprompt",
        ],
        check=True,
    )

    # CA import (best effort; may fail if store empty)
    run(
        [
            str(kt),
            "-importkeystore",
            "-srckeystore",
            "NONE",
            "-srcstoretype",
            "Windows-CA",
            "-destkeystore",
            str(truststore_path),
            "-deststoretype",
            "PKCS12",
            "-deststorepass",
            password,
            "-noprompt",
        ],
        check=False,
    )


def write_marker(marker: Path, java_home: Path) -> None:
    marker.parent.mkdir(parents=True, exist_ok=True)
    marker.write_text(str(java_home), encoding="utf-8")


def set_user_env_windows(java_home: Path) -> None:
    # Persist for new terminals
    run(["setx", "JAVA_HOME", str(java_home)], check=False)
    # Current process
    os.environ["JAVA_HOME"] = str(java_home)
    bin_path = str(java_home / "bin")
    os.environ["PATH"] = f"{bin_path};{os.environ.get('PATH', '')}"


def build_maven_opts(truststore: Path, password: str, existing: str) -> str:
    opts = (
        f"-Djavax.net.ssl.trustStore={truststore} "
        f"-Djavax.net.ssl.trustStoreType=PKCS12 "
        f"-Djavax.net.ssl.trustStorePassword={password}"
    )
    return f"{opts} {existing}".strip()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-root", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--print-env", action="store_true", help="Print export/set lines only")
    args = parser.parse_args()

    project_root = Path(args.project_root).resolve()
    jdk_root = project_root / ".jdk"
    marker = jdk_root / "jdk.home"
    cache_dir = jdk_root / "cache"
    extract_dir = jdk_root / "extract"
    truststore = project_root / ".certs" / "maven-truststore.p12"

    java_home = (
        find_java_home_from_env()
        or find_java_home_from_marker(marker)
        or find_java_home_from_extract(extract_dir)
    )

    if not java_home:
        if os.name == "nt":
            java_home = ensure_windows_jdk23(project_root, cache_dir, extract_dir)
        else:
            raise RuntimeError(
                "JDK 23 not found. Set JAVA_HOME to a JDK 23 installation on Linux/macOS."
            )

    write_marker(marker, java_home)
    if os.name == "nt":
        set_user_env_windows(java_home)
        create_windows_truststore(java_home, truststore, TRUSTSTORE_PASSWORD)
    else:
        truststore = Path()

    maven_opts = os.environ.get("MAVEN_OPTS", "")
    if os.name == "nt":
        maven_opts = build_maven_opts(truststore, TRUSTSTORE_PASSWORD, maven_opts)

    if args.print_env:
        if os.name == "nt":
            print(f"JAVA_HOME={java_home}")
            print(f"MAVEN_OPTS={maven_opts}")
        else:
            print(f"JAVA_HOME={java_home}")
    else:
        log(f"JAVA_HOME={java_home}")
        if os.name == "nt":
            log(f"Truststore={truststore}")
            log("Use this MAVEN_OPTS in current terminal:")
            log(maven_opts)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"[prepare_env.py] ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
