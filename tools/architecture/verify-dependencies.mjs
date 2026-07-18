import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const coreRoot = path.join(workspaceRoot, 'packages', 'core');
const angularRoot = path.join(workspaceRoot, 'packages', 'angular');
const demoRoot = path.join(workspaceRoot, 'apps', 'angular-demo');
const failures = [];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function walkFiles(directory, predicate) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath, predicate));
    } else if (entry.isFile() && predicate(entryPath)) {
      files.push(entryPath);
    }
  }
  return files;
}

function sourceFiles(root) {
  return walkFiles(path.join(root, 'src'), (file) => file.endsWith('.ts'));
}

function findSourceMatches(root, pattern) {
  return sourceFiles(root).filter((file) => pattern.test(fs.readFileSync(file, 'utf8')));
}

function relative(file) {
  return path.relative(workspaceRoot, file).replaceAll('\\', '/');
}

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

for (const root of [coreRoot, angularRoot, demoRoot]) {
  expect(fs.existsSync(root), `Missing workspace project: ${relative(root)}`);
}

if (failures.length === 0) {
  const corePackage = readJson(path.join(coreRoot, 'package.json'));
  const angularPackage = readJson(path.join(angularRoot, 'package.json'));
  const demoPackage = readJson(path.join(demoRoot, 'package.json'));
  const coreDependencies = {
    ...corePackage.dependencies,
    ...corePackage.peerDependencies,
    ...corePackage.optionalDependencies
  };

  expect(corePackage.name === '@policy-validation/core', 'Core package name must be @policy-validation/core.');
  expect(angularPackage.name === '@policy-validation/angular', 'Angular package name must be @policy-validation/angular.');
  expect(
    angularPackage.peerDependencies?.['@policy-validation/core'] === '^1.0.0',
    'Angular adapter must declare @policy-validation/core as a peer dependency.'
  );
  expect(
    demoPackage.dependencies?.['@policy-validation/angular'] === angularPackage.version,
    'Angular demo must depend on the local Angular adapter version.'
  );
  expect(
    demoPackage.dependencies?.['@policy-validation/core'] === undefined,
    'Angular demo must consume framework-neutral APIs through @policy-validation/angular.'
  );

  for (const dependency of Object.keys(coreDependencies)) {
    expect(!dependency.startsWith('@angular/'), `Core package cannot depend on Angular: ${dependency}`);
  }

  const forbiddenCoreFiles = findSourceMatches(
    coreRoot,
    /(?:from\s+|import\s*\()(['"])(?:@angular\/|@policy-validation\/angular|(?:\.\.\/)+angular(?:\/|\1))/
  );
  for (const file of forbiddenCoreFiles) {
    failures.push(`Core source has a forbidden framework dependency: ${relative(file)}`);
  }

  expect(
    findSourceMatches(angularRoot, /(['"])@policy-validation\/core\1/).length > 0,
    'Angular adapter source must consume @policy-validation/core.'
  );
  expect(
    findSourceMatches(demoRoot, /(['"])@policy-validation\/angular\1/).length > 0,
    'Angular demo source must consume @policy-validation/angular.'
  );
  for (const file of findSourceMatches(demoRoot, /(['"])@policy-validation\/core\1/)) {
    failures.push(`Angular demo bypasses the adapter: ${relative(file)}`);
  }

  for (const framework of ['react', 'vue']) {
    expect(
      !fs.existsSync(path.join(workspaceRoot, 'packages', framework))
        && !fs.existsSync(path.join(workspaceRoot, 'apps', `${framework}-demo`)),
      `Out-of-scope ${framework} placeholder detected.`
    );
  }
}

if (failures.length > 0) {
  console.error(`Architecture verification failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Verified dependency direction: angular-demo -> angular -> core.');
  console.log('Verified that @policy-validation/core has no Angular dependency.');
}
