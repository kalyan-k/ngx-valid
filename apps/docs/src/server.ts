import { createReadStream, readFileSync } from 'node:fs';
import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentationCatalog, documentationEntry, type DocumentationEntry } from './catalog.js';
import { renderMarkdown } from './markdown.js';

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(sourceDirectory, '..', '..', '..');
const contentRoot = path.join(workspaceRoot, 'docs', 'site');
const publicRoot = path.join(workspaceRoot, 'apps', 'docs', 'public');
const docsPort = configuredPort('VALIDATION_RULES_DOCS_PORT', 4201);
const portalUrl = process.env['VALIDATION_RULES_PORTAL_URL'] ?? 'http://127.0.0.1:4200';
const angularDemoUrl = process.env['VALIDATION_RULES_ANGULAR_DEMO_URL'] ?? 'http://127.0.0.1:4202';
const ngrxDemoUrl = process.env['VALIDATION_RULES_NGRX_DEMO_URL'] ?? 'http://127.0.0.1:4203';

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
    const query = (requestUrl.searchParams.get('q') ?? '').trim().toLowerCase();
    const matches = documentationCatalog.filter((entry) => searchableText(entry).includes(query));
    sendJson(response, 200, { results: matches.map(({ slug, title, section, summary }) => ({ slug, title, section, summary })) });
    return;
  }
  if (requestUrl.pathname === '/styles.css') {
    response.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'no-store' });
    createReadStream(path.join(publicRoot, 'styles.css')).pipe(response);
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
    <section class="nav-section"><h2>${escapeHtml(section)}</h2>${documentationCatalog.filter((item) => item.section === section).map((item) => `<a data-search="${escapeHtml(`${item.title} ${item.summary}`.toLowerCase())}" class="${item === entry ? 'active' : ''}" href="/docs/${item.slug}">${escapeHtml(item.title)}</a>`).join('')}</section>
  `).join('');
  const demoLinks = entry?.slug === 'ngrx'
    ? `<a class="demo-link" href="${ngrxDemoUrl}"><strong>Open Angular + NgRx Demo</strong><span>Try state-only and Reactive Forms workflows →</span></a>`
    : `<a class="demo-link" href="${angularDemoUrl}${entry?.demoPath ?? ''}"><strong>Open Angular Demo</strong><span>See the concepts running in a real application →</span></a>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escapeHtml(entry?.summary ?? 'Validation Rules documentation')}"><title>${escapeHtml(entry?.title ?? 'Not found')} · Validation Rules</title><link rel="stylesheet" href="/styles.css"></head>
  <body><header class="topbar"><a class="brand" href="${portalUrl}"><span>VR</span><strong>Validation Rules</strong><small>Documentation</small></a><nav><a href="${portalUrl}">Portal</a><a href="${angularDemoUrl}">Angular</a><a href="${ngrxDemoUrl}">Angular + NgRx</a><a href="https://github.com/kalyan-k/validation-rules">GitHub</a></nav></header>
  <div class="docs-layout"><aside><label for="docs-search">Search documentation</label><input id="docs-search" type="search" placeholder="Filter topics…" autocomplete="off">${groupedNavigation}</aside>
  <main><div class="breadcrumb"><a href="${portalUrl}">Demo Portal</a><span>/</span><span>${escapeHtml(entry?.section ?? 'Documentation')}</span></div><article>${content}</article>
  ${entry ? `<section class="live-example"><p>Continue in the live platform</p>${demoLinks}</section>` : ''}
  <nav class="pager" aria-label="Documentation pages">${previous ? `<a href="/docs/${previous.slug}"><small>Previous</small><strong>← ${escapeHtml(previous.title)}</strong></a>` : '<span></span>'}${next ? `<a class="next" href="/docs/${next.slug}"><small>Next</small><strong>${escapeHtml(next.title)} →</strong></a>` : ''}</nav></main>
  <aside class="on-page"><strong>On this page</strong><p>${escapeHtml(entry?.summary ?? '')}</p><a href="${portalUrl}">Back to Demo Portal →</a><a href="http://127.0.0.1:4200/reports/index.html">Test reports →</a></aside></div>
  <script>const input=document.querySelector('#docs-search');input.addEventListener('input',()=>{const q=input.value.toLowerCase();document.querySelectorAll('[data-search]').forEach(link=>link.hidden=!link.dataset.search.includes(q));});</script></body></html>`;
}

function searchableText(entry: DocumentationEntry): string {
  const source = readFileSync(path.join(contentRoot, entry.source), 'utf8');
  return `${entry.title} ${entry.section} ${entry.summary} ${source}`.toLowerCase();
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
