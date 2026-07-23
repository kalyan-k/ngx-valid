import { createReadStream, readFileSync } from 'node:fs';
import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentationCatalog, documentationEntry, type DocumentationEntry } from './catalog.js';
import { renderMarkdown } from './markdown.js';
import { buildSearchIndex, searchDocumentation } from './search.js';

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(sourceDirectory, '..', '..', '..');
const contentRoot = path.join(workspaceRoot, 'docs', 'site');
const publicRoot = path.join(workspaceRoot, 'apps', 'docs', 'public');
const shellRoot = path.join(workspaceRoot, 'tools', 'platform-shell');
const docsPort = configuredPort('VALIDATION_RULES_DOCS_PORT', 4201);
const portalUrl = process.env['VALIDATION_RULES_PORTAL_URL'] ?? 'http://127.0.0.1:4200';
const angularDemoUrl = process.env['VALIDATION_RULES_ANGULAR_DEMO_URL'] ?? 'http://127.0.0.1:4202';
const reactDemoUrl = process.env['VALIDATION_RULES_REACT_DEMO_URL'] ?? 'http://127.0.0.1:4204';
const workspacePackage = JSON.parse(readFileSync(path.join(workspaceRoot, 'package.json'), 'utf8')) as { version?: string };
const assetVersion = encodeURIComponent(workspacePackage.version ?? '0.0.0');
const platformAssets = new Set([
  'favicon.ico', 'platform-shell.css', 'platform-shell.js', 'platform-theme.css', 'site.webmanifest',
  'validation-rules-mark.svg',
  ...[16, 32, 64, 180, 192, 512].map((size) => `validation-rules-icon-${size}.png`)
]);
const platformContentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8', '.ico': 'image/x-icon', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json'
};
const documentationSearchIndex = buildSearchIndex(
  documentationCatalog,
  (entry) => readFileSync(path.join(contentRoot, entry.source), 'utf8')
);

export function createDocumentationServer(): http.Server {
  return http.createServer((request, response) => handleRequest(request, response));
}

function handleRequest(request: IncomingMessage, response: ServerResponse): void {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);
  if (requestUrl.pathname === '/health') {
    sendJson(response, 200, { status: 'healthy', service: 'documentation' });
    return;
  }
  if (requestUrl.pathname === '/api/search') {
    sendJson(response, 200, { results: searchDocumentation(documentationSearchIndex, requestUrl.searchParams.get('q') ?? '') });
    return;
  }
  if (requestUrl.pathname === '/search-index.json') {
    sendJson(response, 200, { documents: documentationSearchIndex });
    return;
  }
  if (requestUrl.pathname === '/search.js') {
    response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
    createReadStream(path.join(publicRoot, 'search.js')).pipe(response);
    return;
  }
  if (requestUrl.pathname === '/styles.css') {
    response.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'no-store' });
    createReadStream(path.join(publicRoot, 'styles.css')).pipe(response);
    return;
  }
  if (platformAssets.has(requestUrl.pathname.slice(1))) {
    response.writeHead(200, {
      'Content-Type': platformContentTypes[path.extname(requestUrl.pathname)] ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=3600'
    });
    createReadStream(path.join(shellRoot, requestUrl.pathname.slice(1))).pipe(response);
    return;
  }
  if (requestUrl.pathname === '/') {
    response.writeHead(302, { Location: '/docs/overview' });
    response.end();
    return;
  }
  const match = /^\/docs\/([a-z0-9-]+)$/.exec(requestUrl.pathname);
  const entry = match?.[1] ? documentationEntry(match[1]) : undefined;
  if (!entry) {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(renderPage(undefined, '<h1>Page not found</h1><p>Choose a documentation topic from the navigation.</p>'));
    return;
  }
  const markdown = readFileSync(path.join(contentRoot, entry.source), 'utf8');
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(renderPage(entry, renderMarkdown(markdown)));
}

function renderPage(entry: DocumentationEntry | undefined, content: string): string {
  const currentIndex = entry ? documentationCatalog.indexOf(entry) : -1;
  const previous = currentIndex > 0 ? documentationCatalog[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 && currentIndex < documentationCatalog.length - 1 ? documentationCatalog[currentIndex + 1] : undefined;
  const groupedNavigation = [...new Set(documentationCatalog.map(({ section }) => section))].map((section) => `
    <section class="nav-section"><h2>${escapeHtml(section)}</h2>${documentationCatalog.filter((item) => item.section === section).map((item) => `<a data-search="${escapeHtml(`${item.title} ${item.summary}`.toLowerCase())}" class="${item === entry ? 'active' : ''}"${item === entry ? ' aria-current="page"' : ''} href="/docs/${item.slug}">${escapeHtml(item.title)}</a>`).join('')}</section>
  `).join('');
  const demoLinks = entry?.slug.startsWith('react-')
    ? `<a class="demo-link" href="${reactDemoUrl}${entry.demoPath ?? ''}"><strong>Open React Demo</strong><span>Try the hooks and policies in a live React application â†’</span></a>`
    : entry?.section === 'Core Package'
    ? `<a class="demo-link" href="${portalUrl}"><strong>Open Demo Portal</strong><span>Choose Angular or React demos that all use Core policies â†’</span></a>`
    : `<a class="demo-link" href="${angularDemoUrl}${entry?.demoPath ?? ''}"><strong>Open Angular Demo</strong><span>See the concepts running in a real application â†’</span></a>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escapeHtml(entry?.summary ?? 'Validation Rules documentation')}"><meta name="theme-color" content="#10243e"><title>${escapeHtml(entry?.title ?? 'Not found')} Â· Validation Rules</title><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" href="/validation-rules-mark.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/validation-rules-icon-180.png"><link rel="manifest" href="/site.webmanifest"><link rel="preload" href="/platform-shell.css" as="style"><link rel="stylesheet" href="/platform-shell.css"><link rel="stylesheet" href="/platform-theme.css"><link rel="stylesheet" href="/styles.css"><script src="/platform-shell.js?v=${assetVersion}"></script><script src="/search.js?v=${assetVersion}" defer></script></head>
  <body><validation-platform-shell active-application="documentation" application-name="Documentation" version="${escapeHtml(workspacePackage.version ?? '0.0.0')}" portal-url="${portalUrl}" docs-url="http://127.0.0.1:${docsPort}" angular-url="${angularDemoUrl}" react-url="${reactDemoUrl}">
  <div class="docs-layout"><aside><div class="docs-search"><label for="docs-search">Search documentation</label><div class="docs-search-control"><input id="docs-search" type="search" placeholder="Search docsâ€¦" autocomplete="off" aria-autocomplete="list" aria-controls="docs-search-results" aria-expanded="false"><button id="docs-search-clear" class="docs-search-clear" type="button" aria-label="Clear documentation search" title="Clear search" hidden>&times;</button></div><div id="docs-search-results" class="search-results" role="listbox" hidden></div></div><div class="docs-navigation">${groupedNavigation}</div></aside>
  <main><div class="vr-breadcrumb"><a href="${portalUrl}">Home</a><span>/</span><a href="/docs/overview">Documentation</a><span>/</span><span>${escapeHtml(entry?.section ?? 'Documentation')}</span></div><article id="docs-content">${content}</article>
  ${entry ? `<section class="live-example"><p>Continue in the live platform</p>${demoLinks}</section>` : ''}
  <nav class="pager" aria-label="Documentation pages">${previous ? `<a href="/docs/${previous.slug}"><small>Previous</small><strong>â† ${escapeHtml(previous.title)}</strong></a>` : '<span></span>'}${next ? `<a class="next" href="/docs/${next.slug}"><small>Next</small><strong>${escapeHtml(next.title)} â†’</strong></a>` : ''}</nav></main>
  <aside class="on-page"><strong>On this page</strong><p>${escapeHtml(entry?.summary ?? '')}</p><a href="${portalUrl}">Back to Demo Portal â†’</a><a href="${portalUrl}/reports/index.html">Test reports â†’</a></aside></div>
  </validation-platform-shell></body></html>`;
}

function configuredPort(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createDocumentationServer().listen(docsPort, '127.0.0.1', () => {
    console.log(`Validation Rules Documentation: http://127.0.0.1:${docsPort}`);
  });
}
