import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const coreRoot = path.join(workspaceRoot, 'packages', 'core');
const angularRoot = path.join(workspaceRoot, 'packages', 'angular');
const demoRoot = path.join(workspaceRoot, 'apps', 'angular-demo');
const ngrxDemoRoot = path.join(workspaceRoot, 'apps', 'angular-ngrx-demo');
const portalRoot = path.join(workspaceRoot, 'apps', 'demo');
const docsRoot = path.join(workspaceRoot, 'apps', 'docs');
const platformShellRoot = path.join(workspaceRoot, 'tools', 'platform-shell');
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

for (const root of [coreRoot, angularRoot, demoRoot, ngrxDemoRoot, portalRoot, docsRoot]) {
  expect(fs.existsSync(root), `Missing workspace project: ${relative(root)}`);
}
for (const file of [
  'platform-shell.js',
  'platform-shell.css',
  'platform-theme.css',
  'validation-rules-mark.svg',
  'validation-rules-icon-32.png',
  'validation-rules-icon-180.png',
  'validation-rules-icon-192.png',
  'validation-rules-icon-512.png',
  'favicon.ico',
  'site.webmanifest'
]) {
  const shellFile = path.join(platformShellRoot, file);
  expect(fs.existsSync(shellFile), `Missing shared application-shell asset: ${relative(shellFile)}`);
}

if (failures.length === 0) {
  const corePackage = readJson(path.join(coreRoot, 'package.json'));
  const angularPackage = readJson(path.join(angularRoot, 'package.json'));
  const demoPackage = readJson(path.join(demoRoot, 'package.json'));
  const ngrxDemoPackage = readJson(path.join(ngrxDemoRoot, 'package.json'));
  const portalPackage = readJson(path.join(portalRoot, 'package.json'));
  const docsPackage = readJson(path.join(docsRoot, 'package.json'));
  const coreDependencies = {
    ...corePackage.dependencies,
    ...corePackage.peerDependencies,
    ...corePackage.optionalDependencies
  };

  expect(corePackage.name === '@validation-rules/core', 'Core package name must be @validation-rules/core.');
  expect(angularPackage.name === '@validation-rules/angular', 'Angular package name must be @validation-rules/angular.');
  expect(
    angularPackage.peerDependencies?.['@validation-rules/core'] === '^1.0.0',
    'Angular adapter must declare @validation-rules/core as a peer dependency.'
  );
  expect(
    demoPackage.dependencies?.['@validation-rules/angular'] === angularPackage.version,
    'Angular demo must depend on the local Angular adapter version.'
  );
  expect(
    demoPackage.dependencies?.['@validation-rules/core'] === undefined,
    'Angular demo must consume framework-neutral APIs through @validation-rules/angular.'
  );
  expect(ngrxDemoPackage.private === true, 'Angular + NgRx demo must remain private.');
  expect(portalPackage.private === true, 'Demo portal must remain private.');
  expect(docsPackage.private === true, 'Documentation application must remain private.');
  expect(
    ngrxDemoPackage.dependencies?.['@validation-rules/angular'] === angularPackage.version,
    'Angular + NgRx demo must depend on the local Angular adapter version.'
  );
  expect(
    ngrxDemoPackage.dependencies?.['@validation-rules/core'] === undefined,
    'Angular + NgRx demo must consume framework-neutral APIs through @validation-rules/angular.'
  );
  expect(
    typeof ngrxDemoPackage.dependencies?.['@ngrx/store'] === 'string',
    'Angular + NgRx demo must declare @ngrx/store.'
  );

  for (const dependency of Object.keys(coreDependencies)) {
    expect(!dependency.startsWith('@angular/'), `Core package cannot depend on Angular: ${dependency}`);
  }

  const forbiddenCoreFiles = findSourceMatches(
    coreRoot,
    /(?:from\s+|import\s*\()(['"])(?:@angular\/|@validation-rules\/angular|(?:\.\.\/)+angular(?:\/|\1))/
  );
  for (const file of forbiddenCoreFiles) {
    failures.push(`Core source has a forbidden framework dependency: ${relative(file)}`);
  }

  expect(
    findSourceMatches(angularRoot, /(['"])@validation-rules\/core\1/).length > 0,
    'Angular adapter source must consume @validation-rules/core.'
  );
  expect(
    findSourceMatches(demoRoot, /(['"])@validation-rules\/angular\1/).length > 0,
    'Angular demo source must consume @validation-rules/angular.'
  );
  for (const file of findSourceMatches(demoRoot, /(['"])@validation-rules\/core\1/)) {
    failures.push(`Angular demo bypasses the adapter: ${relative(file)}`);
  }
  expect(
    findSourceMatches(ngrxDemoRoot, /(['"])@validation-rules\/angular\1/).length > 0,
    'Angular + NgRx demo source must consume @validation-rules/angular.'
  );
  expect(
    findSourceMatches(ngrxDemoRoot, /(['"])@ngrx\/store\1/).length > 0,
    'Angular + NgRx demo source must demonstrate @ngrx/store.'
  );
  for (const file of findSourceMatches(ngrxDemoRoot, /(['"])@validation-rules\/core\1/)) {
    failures.push(`Angular + NgRx demo bypasses the adapter: ${relative(file)}`);
  }

  const angularImports = /(?:from\s+|import\s*\()(['"])(?:@angular\/|@ngrx\/|@validation-rules\/angular)\S*\1/;
  for (const root of [portalRoot, docsRoot]) {
    for (const file of findSourceMatches(root, angularImports)) {
      failures.push(`Framework-neutral Node application has an Angular-specific dependency: ${relative(file)}`);
    }
  }

  const shellConsumers = [
    path.join(portalRoot, 'public', 'index.html'),
    path.join(docsRoot, 'src', 'server.ts'),
    path.join(demoRoot, 'src', 'app', 'app.component.html'),
    path.join(ngrxDemoRoot, 'src', 'app', 'app.component.html')
  ];
  for (const file of shellConsumers) {
    expect(
      fs.readFileSync(file, 'utf8').includes('validation-platform-shell'),
      `${relative(file)} must render the shared application shell.`
    );
  }

  const shellSource = fs.readFileSync(path.join(platformShellRoot, 'platform-shell.js'), 'utf8');
  for (const label of ['Home', 'Docs', 'Demos', 'Reports', 'GitHub']) {
    expect(shellSource.includes(label), `Shared application shell must expose the ${label} navigation destination.`);
  }
  expect(
    shellSource.includes('/docs/roadmap') && shellSource.includes('/docs/faq'),
    'Shared documentation navigation must expose Roadmap and FAQ deep links.'
  );
  expect(
    fs.existsSync(path.join(docsRoot, 'src', 'search.ts'))
      && fs.existsSync(path.join(docsRoot, 'public', 'search.js')),
    'Documentation application must provide a client-side search index and controller.'
  );
  expect(
    !fs.existsSync(path.join(demoRoot, 'src', 'app', 'pages', 'docs', 'docs.component.ts')),
    'Angular demo must not duplicate the authoritative documentation application.'
  );
  expect(
    fs.readFileSync(path.join(workspaceRoot, 'docs', 'site', 'angular.md'), 'utf8').includes('## Template-driven controls'),
    'Angular-specific documentation consolidated from the demo must remain in the documentation application.'
  );
  expect(
    fs.existsSync(path.join(ngrxDemoRoot, 'src', 'app', 'pages', 'home', 'home.component.ts')),
    'Angular + NgRx demo must provide a landing page parallel to the Angular demo.'
  );
  for (const file of [
    path.join(demoRoot, 'src', 'app', 'layout', 'demo-shell.component.html'),
    path.join(ngrxDemoRoot, 'src', 'app', 'app.component.html')
  ]) {
    expect(fs.readFileSync(file, 'utf8').includes('vr-demo-shell'), `${relative(file)} must use the shared demo layout.`);
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
  console.log('Verified dependency direction: Angular demos -> angular adapter -> core engine.');
  console.log('Verified that the portal and documentation applications remain Angular-free.');
  console.log('Verified that @validation-rules/core has no Angular dependency.');
  console.log('Verified that every application renders the shared platform shell.');
}
