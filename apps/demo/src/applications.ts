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
const ngrxDemoPort = configuredPort('VALIDATION_RULES_NGRX_DEMO_PORT', 4203);
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
    description: 'The original ngModel-based demo with Bootstrap, Material, and Tailwind display strategies.',
    kind: 'demo',
    url: `http://127.0.0.1:${angularDemoPort}`,
    healthUrl: `http://127.0.0.1:${angularDemoPort}`,
    startScript: 'serve:angular-demo:portal',
    startArgs: ['--host', '127.0.0.1', '--port', String(angularDemoPort)],
    documentationUrl: `http://127.0.0.1:${docsPort}/docs/angular`,
    tags: ['ngModel', 'Policies', 'Display strategies']
  },
  {
    id: 'angular-ngrx-demo',
    title: 'Angular + NgRx Demo',
    shortTitle: 'Angular + NgRx',
    description: 'State-first validation and an enterprise Reactive Forms synchronization workflow.',
    kind: 'demo',
    url: `http://127.0.0.1:${ngrxDemoPort}`,
    healthUrl: `http://127.0.0.1:${ngrxDemoPort}`,
    startScript: 'serve:ngrx-demo:portal',
    startArgs: ['--host', '127.0.0.1', '--port', String(ngrxDemoPort)],
    documentationUrl: `http://127.0.0.1:${docsPort}/docs/ngrx`,
    tags: ['NgRx', 'State', 'Reactive Forms']
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
