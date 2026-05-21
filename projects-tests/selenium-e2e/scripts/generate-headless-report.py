#!/usr/bin/env python3
"""Parse Surefire XML reports, write HEADLESS-RUN-REPORT.md and logs/headless-run-*.log."""

from __future__ import annotations

import argparse
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from statistics import mean, median

MODULE_ROOT = Path(__file__).resolve().parent.parent
REPORTS_DIR = MODULE_ROOT / "target" / "surefire-reports"
LOGS_DIR = MODULE_ROOT / "logs"
REPORT_MD = MODULE_ROOT / "HEADLESS-RUN-REPORT.md"
DEFAULT_WALL_CLOCK_MS = 1_718_756


def short_name(classname: str) -> str:
    return classname.split(".")[-1]


def parse_reports() -> tuple[list[dict], list[dict], dict[str, dict]]:
    rows: list[dict] = []
    issues: list[dict] = []
    suite_stats: dict[str, dict] = {}

    for xml in sorted(REPORTS_DIR.glob("TEST-*.xml")):
        root = ET.parse(xml).getroot()
        suite = root.get("name", "")
        suite_stats[suite] = {
            "time": float(root.get("time", 0) or 0),
            "tests": int(root.get("tests", 0) or 0),
            "failures": int(root.get("failures", 0) or 0),
            "errors": int(root.get("errors", 0) or 0),
        }
        for tc in root.findall("testcase"):
            cls = tc.get("classname", "")
            name = tc.get("name", "")
            elapsed = float(tc.get("time", 0) or 0)
            status = "PASS"
            message = ""
            stack = ""
            for tag, label in [("failure", "FAIL"), ("error", "ERROR")]:
                el = tc.find(tag)
                if el is not None:
                    status = label
                    message = (el.get("message") or "").strip() or (el.text or "")[:800].strip()
                    message = " ".join(message.split())
                    stack = (el.text or "").strip()
                    issues.append(
                        {
                            "status": label,
                            "class": cls,
                            "method": name,
                            "time": elapsed,
                            "message": message,
                            "stack": stack,
                            "xml": xml.name,
                        }
                    )
                    break
            if "FeatureTest" in cls or "support." in cls:
                rows.append(
                    {
                        "class": cls,
                        "method": name,
                        "time": elapsed,
                        "status": status,
                        "suite": suite,
                    }
                )

    rows.sort(key=lambda r: r["time"], reverse=True)
    return rows, issues, suite_stats


def class_averages(rows: list[dict]) -> list[tuple[str, float, int]]:
    by_class: dict[str, list[float]] = {}
    for row in rows:
        by_class.setdefault(row["class"], []).append(row["time"])
    result = [
        (cls, mean(times), len(times))
        for cls, times in by_class.items()
    ]
    result.sort(key=lambda item: item[1], reverse=True)
    return result


def write_log_file(
    log_path: Path,
    rows: list[dict],
    issues: list[dict],
    suite_stats: dict[str, dict],
    wall_clock_ms: int,
    maven_log: Path | None,
) -> None:
    times = [r["time"] for r in rows]
    passed = sum(1 for r in rows if r["status"] == "PASS")
    lines = [
        "=" * 80,
        "SELENIUM E2E HEADLESS RUN LOG",
        "=" * 80,
        f"Timestamp: {datetime.now().isoformat(timespec='seconds')}",
        "Command: mvn test -Dheadless=true",
        f"Module: {MODULE_ROOT}",
        "",
        "--- SUMMARY ---",
        f"Total tests: {len(rows)}",
        f"Passed: {passed}",
        f"Failed: {sum(1 for i in issues if i['status'] == 'FAIL')}",
        f"Errors: {sum(1 for i in issues if i['status'] == 'ERROR')}",
        f"Wall-clock (ms): {wall_clock_ms}",
        f"Wall-clock (min): {wall_clock_ms / 60_000:.2f}",
        f"Average per test (s): {mean(times):.2f}",
        f"Median per test (s): {median(times):.2f}",
        f"Sum per-test times (s): {sum(times):.2f}",
        "",
        "--- TOP 10 SLOWEST TESTS ---",
    ]
    for index, row in enumerate(rows[:10], start=1):
        lines.append(
            f"{index:2}. [{row['status']}] {row['time']:.2f}s "
            f"{short_name(row['class'])}.{row['method']}"
        )
    lines.append("")
    lines.append("--- AVERAGE TIME BY CLASS ---")
    for cls, avg, count in class_averages(rows):
        lines.append(f"{avg:7.2f}s avg ({count:2} tests)  {short_name(cls)}")
    lines.append("")

    if issues:
        lines.append("--- ERRORS AND FAILURES (detail) ---")
        for item in issues:
            lines.append("")
            lines.append("-" * 60)
            lines.append(
                f"{item['status']}: {short_name(item['class'])}.{item['method']} "
                f"({item['time']:.2f}s) [{item['xml']}]"
            )
            lines.append(f"Message: {item['message']}")
            if item["stack"]:
                lines.append("Stack trace:")
                lines.append(item["stack"])
        lines.append("")

    lines.append("--- SUREFIRE TEXT REPORTS ---")
    for txt in sorted(REPORTS_DIR.glob("*.txt")):
        if txt.name.startswith("com.") or txt.name.startswith("TEST-"):
            continue
        content = txt.read_text(encoding="utf-8", errors="replace").strip()
        if not content:
            continue
        lines.append("")
        lines.append("=" * 60)
        lines.append(f"FILE: {txt.name}")
        lines.append("=" * 60)
        lines.append(content)

    if maven_log and maven_log.is_file():
        lines.append("")
        lines.append("=" * 60)
        lines.append(f"MAVEN CONSOLE LOG: {maven_log.name}")
        lines.append("=" * 60)
        lines.append(maven_log.read_text(encoding="utf-8", errors="replace"))

    log_path.parent.mkdir(parents=True, exist_ok=True)
    log_path.write_text("\n".join(lines), encoding="utf-8")


def write_markdown(
    rows: list[dict],
    issues: list[dict],
    suite_stats: dict[str, dict],
    wall_clock_ms: int,
    log_path: Path,
) -> None:
    times = [r["time"] for r in rows]
    passed = sum(1 for r in rows if r["status"] == "PASS")
    avg_all = mean(times)
    top10 = rows[:10]

    lines = [
        "# Selenium E2E — Headless Run Report",
        "",
        f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}  ",
        "**Command:** `mvn test -Dheadless=true`  ",
        "**Module:** `projects-tests/selenium-e2e`  ",
        f"**Result:** {'FAILED' if issues else 'PASSED'} (Maven exit code {'1' if issues else '0'})  ",
        f"**Full log file:** [`logs/{log_path.name}`](logs/{log_path.name})",
        "",
        "## Summary",
        "",
        "| Metric | Value |",
        "|--------|-------|",
        f"| Total tests | {len(rows)} |",
        f"| Passed | {passed} |",
        f"| Failed | {sum(1 for i in issues if i['status'] == 'FAIL')} |",
        f"| Errors | {sum(1 for i in issues if i['status'] == 'ERROR')} |",
        f"| **Average time per test** | **{avg_all:.2f} s** |",
        f"| Median per test | {median(times):.2f} s |",
        f"| Wall-clock duration | {wall_clock_ms / 60_000:.1f} min ({wall_clock_ms / 1000:.0f} s) |",
        f"| Sum of per-test times | {sum(times):.1f} s ({sum(times) / 60:.1f} min) |",
        "| Parallelism (JUnit) | 1 feature class at a time, up to 3 tests in parallel (`junit-platform.properties`) |",
        "",
        "> **Note:** Per-test times can spike on Chrome/session timeouts, not only slow flows.",
        "",
        "## Top 10 slowest tests",
        "",
        "| Rank | Time (s) | Status | Class | Method |",
        "|------|----------|--------|-------|--------|",
    ]
    for rank, row in enumerate(top10, start=1):
        lines.append(
            f"| {rank} | {row['time']:.2f} | {row['status']} | "
            f"`{short_name(row['class'])}` | `{row['method']}` |"
        )
    lines.append("")

    lines += [
        "## Average time by test class",
        "",
        "| Class | Tests | Avg (s) | Total suite (s) |",
        "|-------|-------|---------|-----------------|",
    ]
    for cls, avg, count in class_averages(rows):
        suite_name = next((r["suite"] for r in rows if r["class"] == cls), "")
        suite_time = suite_stats.get(suite_name, {}).get("time", 0)
        lines.append(
            f"| `{short_name(cls)}` | {count} | {avg:.2f} | {suite_time:.1f} |"
        )
    lines.append("")

    if issues:
        lines += ["## Tests with errors or failures", ""]
        lines += [
            "| Status | Class | Method | Time (s) | Cause (excerpt) |",
            "|--------|-------|--------|----------|-----------------|",
        ]
        for item in issues:
            excerpt = item["message"][:180].replace("|", "/")
            if len(item["message"]) > 180:
                excerpt += "…"
            lines.append(
                f"| {item['status']} | `{short_name(item['class'])}` | `{item['method']}` | "
                f"{item['time']:.2f} | {excerpt} |"
            )
        lines.append("")
        lines += [
            "See [`logs/"
            + log_path.name
            + "`](logs/"
            + log_path.name
            + ") for full stack traces and Surefire output.",
            "",
        ]

    lines += [
        "## Duration by test class (Surefire suite time)",
        "",
        "| Class | Suite (s) | Tests | Pass | Fail | Error |",
        "|-------|-----------|-------|------|------|-------|",
    ]
    for suite, st in sorted(suite_stats.items(), key=lambda x: x[1]["time"], reverse=True):
        if "FeatureTest" not in suite and "support." not in suite:
            continue
        ok = st["tests"] - st["failures"] - st["errors"]
        lines.append(
            f"| `{short_name(suite)}` | {st['time']:.1f} | {st['tests']} | {ok} | "
            f"{st['failures']} | {st['errors']} |"
        )
    lines.append("")

    lines += [
        "## All tests sorted by duration",
        "",
        "| Time (s) | Status | Class | Method |",
        "|----------|--------|-------|--------|",
    ]
    for row in rows:
        lines.append(
            f"| {row['time']:.2f} | {row['status']} | `{short_name(row['class'])}` | "
            f"`{row['method']}` |"
        )

    REPORT_MD.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate headless E2E report and log file.")
    parser.add_argument(
        "--wall-clock-ms",
        type=int,
        default=DEFAULT_WALL_CLOCK_MS,
        help="Maven wall-clock duration in milliseconds",
    )
    parser.add_argument(
        "--maven-log",
        type=Path,
        default=None,
        help="Optional path to captured Maven console output",
    )
    args = parser.parse_args()

    if not REPORTS_DIR.is_dir():
        raise SystemExit(f"Surefire reports not found: {REPORTS_DIR}. Run mvn test -Dheadless=true first.")

    rows, issues, suite_stats = parse_reports()
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    log_path = LOGS_DIR / f"headless-run-{stamp}.log"

    write_log_file(log_path, rows, issues, suite_stats, args.wall_clock_ms, args.maven_log)
    write_markdown(rows, issues, suite_stats, args.wall_clock_ms, log_path)

    times = [r["time"] for r in rows]
    print(f"Wrote {REPORT_MD}")
    print(f"Wrote {log_path}")
    print(
        f"Tests: {len(rows)} | pass={sum(1 for r in rows if r['status']=='PASS')} "
        f"| issues={len(issues)} | avg={mean(times):.2f}s"
    )


if __name__ == "__main__":
    main()
