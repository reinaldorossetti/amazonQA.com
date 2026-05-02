const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const repoRoot = path.resolve(root, '..', '..');
const apkDir = path.join(root, 'app', 'apk');

const appApkSrc = path.join(
  repoRoot,
  'mobile-kotlin',
  'androidApp',
  'build',
  'outputs',
  'apk',
  'debug',
  'androidApp-debug.apk'
);

const testApkSrc = path.join(
  repoRoot,
  'mobile-kotlin',
  'androidApp',
  'build',
  'outputs',
  'apk',
  'androidTest',
  'debug',
  'androidApp-debug-androidTest.apk'
);

const appApkDest = path.join(apkDir, 'androidApp-debug.apk');
const testApkDest = path.join(apkDir, 'androidApp-debug-androidTest.apk');

function copyRequiredFile(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`APK não encontrado: ${src}`);
  }
  fs.copyFileSync(src, dest);
}

fs.mkdirSync(apkDir, { recursive: true });
copyRequiredFile(appApkSrc, appApkDest);
copyRequiredFile(testApkSrc, testApkDest);

console.log(`Copied app APK -> ${appApkDest}`);
console.log(`Copied test APK -> ${testApkDest}`);
