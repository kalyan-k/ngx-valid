export interface DocumentationEntry {
  slug: string;
  title: string;
  section: 'Introduction' | 'Packages' | 'Guides' | 'Reference' | 'Project';
  summary: string;
  source: string;
  demoPath?: string;
}

export const documentationCatalog: DocumentationEntry[] = [
  { slug: 'overview', title: 'What is Validation Rules?', section: 'Introduction', summary: 'Purpose, philosophy, and the platform at a glance.', source: 'overview.md' },
  { slug: 'getting-started', title: 'Installation & Quick Start', section: 'Introduction', summary: 'Install, configure, register, and run your first policy.', source: 'getting-started.md', demoPath: '/' },
  { slug: 'core-package', title: 'Core Package', section: 'Packages', summary: 'Framework-neutral contracts, validators, and model state.', source: 'core-package.md' },
  { slug: 'angular', title: 'Angular Package', section: 'Packages', summary: 'Angular lifecycle, registration, directives, and display.', source: 'angular.md', demoPath: '/demos/bootstrap' },
  { slug: 'policies-and-rules', title: 'Policies & Rules', section: 'Guides', summary: 'Compose rule sets and understand execution behavior.', source: 'policies-and-rules.md', demoPath: '/demos/bootstrap' },
  { slug: 'validation-groups', title: 'Validation Groups', section: 'Guides', summary: 'Field groups, policy groups, status, and summaries.', source: 'validation-groups.md', demoPath: '/demos/bootstrap' },
  { slug: 'ngrx', title: 'NgRx Integration', section: 'Guides', summary: 'Pure store state and Reactive Forms synchronization.', source: 'ngrx.md' },
  { slug: 'advanced', title: 'Advanced Examples', section: 'Guides', summary: 'Conditional, asynchronous, nested, and dynamic workflows.', source: 'advanced.md', demoPath: '/demos/bootstrap' },
  { slug: 'public-api', title: 'Public API Reference', section: 'Reference', summary: 'Supported public types, services, and methods.', source: 'public-api.md' },
  { slug: 'architecture', title: 'Architecture', section: 'Project', summary: 'Dependency boundaries, application registry, and build order.', source: 'architecture.md' },
  { slug: 'testing', title: 'Testing, Coverage & Reports', section: 'Project', summary: 'Test commands, coverage gates, and persistent reports.', source: 'testing.md' },
  { slug: 'migration', title: 'Migration', section: 'Project', summary: 'Package boundaries and migration guidance.', source: 'migration.md' },
  { slug: 'roadmap', title: 'Roadmap', section: 'Project', summary: 'Planned platform and adapter directions without placeholder implementations.', source: 'roadmap.md' },
  { slug: 'troubleshooting', title: 'Troubleshooting', section: 'Project', summary: 'Common setup, validation, display, and report issues.', source: 'troubleshooting.md' },
  { slug: 'faq', title: 'FAQ', section: 'Project', summary: 'Frequently asked design and usage questions.', source: 'faq.md' }
];

export function documentationEntry(slug: string): DocumentationEntry | undefined {
  return documentationCatalog.find((entry) => entry.slug === slug);
}
