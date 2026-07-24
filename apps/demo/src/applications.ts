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

function configuredBaseUrl(name: string, fallback: string): string {
  return (process.env[name] ?? fallback).replace(/\/$/, '');
}

export const portalPort = configuredPort('VALIDATION_RULES_PORTAL_PORT', 4200);
const docsPort = configuredPort('VALIDATION_RULES_DOCS_PORT', 4201);
const angularDemoPort = configuredPort('VALIDATION_RULES_ANGULAR_DEMO_PORT', 4202);
const reactDemoPort = configuredPort('VALIDATION_RULES_REACT_DEMO_PORT', 4204);
export const platformUrls = {
  portal: configuredBaseUrl('VALIDATION_RULES_PORTAL_URL', `http://127.0.0.1:${portalPort}`),
  docs: configuredBaseUrl('VALIDATION_RULES_DOCS_URL', `http://127.0.0.1:${docsPort}`),
  angular: configuredBaseUrl('VALIDATION_RULES_ANGULAR_DEMO_URL', `http://127.0.0.1:${angularDemoPort}`),
  react: configuredBaseUrl('VALIDATION_RULES_REACT_DEMO_URL', `http://127.0.0.1:${reactDemoPort}`)
};

export const applicationDefinitions: ApplicationDefinition[] = [
  {
    id: 'docs',
    title: 'Documentation',
    shortTitle: 'Docs',
    description: 'Concepts, guides, public APIs, architecture, testing, and migration guidance.',
    kind: 'documentation',
    url: platformUrls.docs,
    healthUrl: `${platformUrls.docs}/health`,
    startScript: 'serve:docs:portal',
    documentationUrl: `${platformUrls.docs}/docs/overview`,
    tags: ['Guides', 'API', 'Architecture']
  },
  {
    id: 'angular-demo',
    title: 'Angular Demo',
    shortTitle: 'Angular',
    description: 'Angular validation demos with UI framework examples and comparable state management implementations.',
    kind: 'demo',
    url: platformUrls.angular,
    healthUrl: platformUrls.angular,
    startScript: 'serve:angular-demo',
    startArgs: ['--host', '127.0.0.1', '--port', String(angularDemoPort)],
    documentationUrl: `${platformUrls.docs}/docs/angular`,
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
      url: `${platformUrls.angular}/state/${slug}`,
      documentationUrl: `${platformUrls.docs}/docs/${docSlug}`
    }))
  },
  {
    id: 'react-demo',
    title: 'React Demo',
    shortTitle: 'React',
    description: 'Hooks-first controlled forms with nested policies, dynamic groups, accessibility, and measured large-form behavior.',
    kind: 'demo',
    url: platformUrls.react,
    healthUrl: platformUrls.react,
    startScript: 'serve:react-demo',
    startArgs: ['--host', '127.0.0.1', '--port', String(reactDemoPort)],
    documentationUrl: `${platformUrls.docs}/docs/react-overview`,
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
      url: `${platformUrls.react}/state/${slug}`,
      documentationUrl: `${platformUrls.docs}/docs/react-state-${slug}`
    }))
  }
];
