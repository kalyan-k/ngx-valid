export type ApplicationKind = 'documentation' | 'demo';

export interface ApplicationDefinition {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  kind: ApplicationKind;
  url: string;
  healthUrl: string;
  startScript: string;
  startArgs?: string[];
  documentationUrl: string;
  tags: string[];
  demoLinks?: Array<{ label: string; url: string; documentationUrl: string }>;
}

function configuredPort(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const docsPort = configuredPort('VALIDATION_RULES_DOCS_PORT', 4201);
const angularDemoPort = configuredPort('VALIDATION_RULES_ANGULAR_DEMO_PORT', 4202);
const reactDemoPort = configuredPort('VALIDATION_RULES_REACT_DEMO_PORT', 4204);

export const applicationDefinitions: ApplicationDefinition[] = [
  {
    id: 'docs',
    title: 'Documentation',
    shortTitle: 'Docs',
    description: 'Concepts, guides, public APIs, architecture, testing, and migration guidance.',
    kind: 'documentation',
    url: `http://127.0.0.1:${docsPort}`,
    healthUrl: `http://127.0.0.1:${docsPort}/health`,
    startScript: 'serve:docs:portal',
    documentationUrl: `http://127.0.0.1:${docsPort}/docs/overview`,
    tags: ['Guides', 'API', 'Architecture']
  },
  {
    id: 'angular-demo',
    title: 'Angular Demo',
    shortTitle: 'Angular',
    description: 'Angular validation demos with UI framework examples and comparable state management implementations.',
    kind: 'demo',
    url: `http://127.0.0.1:${angularDemoPort}`,
    healthUrl: `http://127.0.0.1:${angularDemoPort}`,
    startScript: 'serve:angular-demo:portal',
    startArgs: ['--host', '127.0.0.1', '--port', String(angularDemoPort)],
    documentationUrl: `http://127.0.0.1:${docsPort}/docs/angular`,
    tags: ['ngModel', 'Reactive Forms', 'NgRx', 'NGXS', 'Signals'],
    demoLinks: [
      ['Template Driven', 'template-driven', 'angular-ngmodel'],
      ['Reactive Forms', 'reactive-forms', 'angular-reactive-forms'],
      ['NgRx', 'ngrx', 'angular-state-ngrx'],
      ['NGXS', 'ngxs', 'angular-state-ngxs'],
      ['Akita', 'akita', 'angular-state-akita'],
      ['Elf', 'elf', 'angular-state-elf'],
      ['RxAngular State', 'rx-angular-state', 'angular-state-rx-angular'],
      ['Signals', 'signals', 'angular-state-signals'],
      ['Custom RxJS Store', 'custom-rxjs-store', 'angular-state-custom-rxjs-store']
    ].map(([label, slug, docSlug]) => ({
      label: label!,
      url: `http://127.0.0.1:${angularDemoPort}/state/${slug}`,
      documentationUrl: `http://127.0.0.1:${docsPort}/docs/${docSlug}`
    }))
  },
  {
    id: 'react-demo',
    title: 'React Demo',
    shortTitle: 'React',
    description: 'Hooks-first controlled forms with nested policies, dynamic groups, accessibility, and measured large-form behavior.',
    kind: 'demo',
    url: `http://127.0.0.1:${reactDemoPort}`,
    healthUrl: `http://127.0.0.1:${reactDemoPort}`,
    startScript: 'serve:react-demo:portal',
    startArgs: ['--host', '127.0.0.1', '--port', String(reactDemoPort)],
    documentationUrl: `http://127.0.0.1:${docsPort}/docs/react-overview`,
    tags: ['React', 'Hooks', 'Seven state integrations'],
    demoLinks: [
      ['Local State', 'local-state'],
      ['Redux Toolkit', 'redux-toolkit'],
      ['Zustand', 'zustand'],
      ['Jotai', 'jotai'],
      ['Recoil', 'recoil'],
      ['MobX', 'mobx'],
      ['Context API', 'context']
    ].map(([label, slug]) => ({
      label: label!,
      url: `http://127.0.0.1:${reactDemoPort}/state/${slug}`,
      documentationUrl: `http://127.0.0.1:${docsPort}/docs/react-state-${slug}`
    }))
  }
];

export const portalPort = configuredPort('VALIDATION_RULES_PORTAL_PORT', 4200);
