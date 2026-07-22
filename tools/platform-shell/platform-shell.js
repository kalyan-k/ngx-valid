const documentationItems = [
  ['Introduction', '/docs/overview'],
  ['Getting Started', '/docs/getting-started'],
  ['Architecture', '/docs/architecture'],
  ['Packages', '/docs/core-package'],
  ['Guides', '/docs/policies-and-rules'],
  ['Examples', '/docs/advanced'],
  ['API', '/docs/public-api'],
  ['Roadmap', '/docs/roadmap'],
  ['FAQ', '/docs/faq']
];

const demoItems = [
  ['Angular Demo', 'angular'],
  ['Angular NgRx Demo', 'ngrx']
];

function normalizedBase(value, fallback) {
  return (value || fallback).replace(/\/$/, '');
}

class ValidationPlatformShell extends HTMLElement {
  static get observedAttributes() {
    return ['version'];
  }

  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const activeApplication = this.getAttribute('active-application') || '';
    const applicationName = this.getAttribute('application-name') || 'Platform';
    const version = this.getAttribute('version') || '0.0.0';
    const brandMarkUrl = this.getAttribute('brand-mark-url') || '/validation-rules-mark.svg';
    const defaultPortalUrl = activeApplication === 'reports' && /^https?:$/u.test(location.protocol)
      ? location.origin
      : 'http://127.0.0.1:4200';
    const urls = {
      portal: normalizedBase(this.getAttribute('portal-url'), defaultPortalUrl),
      docs: normalizedBase(this.getAttribute('docs-url'), 'http://127.0.0.1:4201'),
      angular: normalizedBase(this.getAttribute('angular-url'), 'http://127.0.0.1:4202'),
      ngrx: normalizedBase(this.getAttribute('ngrx-url'), 'http://127.0.0.1:4203')
    };
    const docsActive = activeApplication === 'documentation';
    const demosActive = activeApplication === 'angular-demo' || activeApplication === 'angular-ngrx-demo';
    const docsNavigation = documentationItems.map(([label, path]) => {
      const active = docsActive && location.pathname === path;
      return `<a href="${urls.docs}${path}"${active ? ' aria-current="page" class="active"' : ''}>${label}</a>`;
    }).join('');
    const demosNavigation = demoItems.map(([label, target]) => {
      const applicationId = target === 'angular' ? 'angular-demo' : 'angular-ngrx-demo';
      const active = activeApplication === applicationId;
      return `<a href="${urls[target]}/"${active ? ' aria-current="page" class="active"' : ''}>${label}</a>`;
    }).join('');

    const root = this.attachShadow({ mode: 'open' });
    const injectedStyles = globalThis.validationPlatformShellStyles;
    root.innerHTML = `
      ${injectedStyles ? `<style>${injectedStyles}</style>` : '<link rel="stylesheet" href="/platform-shell.css">'}
      <header class="platform-header" part="header">
        <a class="platform-brand" href="${urls.portal}" aria-label="Validation Rules home">
          <img class="platform-mark" src="${brandMarkUrl}" width="38" height="38" alt="">
          <span class="platform-brand-copy"><strong>Validation Rules</strong><small>${applicationName}</small></span>
        </a>
        <span class="platform-version" data-version title="Workspace version">v${version}</span>
        <button class="platform-menu" type="button" aria-expanded="false" aria-controls="platform-navigation">Menu</button>
        <nav id="platform-navigation" class="platform-navigation" aria-label="Platform navigation">
          <a class="platform-nav-link ${activeApplication === 'demo-portal' ? 'active' : ''}" href="${urls.portal}/"${activeApplication === 'demo-portal' ? ' aria-current="page"' : ''}>Home</a>
          <details class="platform-nav-group ${docsActive ? 'active' : ''}">
            <summary>Docs<span aria-hidden="true"></span></summary>
            <div class="platform-dropdown">${docsNavigation}</div>
          </details>
          <details class="platform-nav-group ${demosActive ? 'active' : ''}">
            <summary>Demos<span aria-hidden="true"></span></summary>
            <div class="platform-dropdown">${demosNavigation}</div>
          </details>
          <a class="platform-nav-link ${activeApplication === 'reports' ? 'active' : ''}" href="${urls.portal}/reports/index.html"${activeApplication === 'reports' ? ' aria-current="page"' : ''}>Reports</a>
          <a class="platform-nav-link" href="https://github.com/kalyan-k/validation-rules">GitHub</a>
        </nav>
      </header>
      <div class="platform-content"><slot></slot></div>
      <footer class="platform-footer" part="footer">
        <div><strong>Validation Rules</strong><span>Policy-driven validation for long-lived applications.</span></div>
        <div class="platform-footer-meta"><span data-version>v${version}</span><span>MIT License</span><a href="${urls.docs}/docs/overview">Documentation</a><a href="https://github.com/kalyan-k/validation-rules">GitHub</a></div>
      </footer>`;

    const button = root.querySelector('.platform-menu');
    const nav = root.querySelector('.platform-navigation');
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open', !expanded);
    });

    const groups = [...root.querySelectorAll('.platform-nav-group')];
    groups.forEach((group) => group.addEventListener('toggle', () => {
      if (group.open) {
        groups.filter((candidate) => candidate !== group).forEach((candidate) => { candidate.open = false; });
      }
    }));
    root.querySelectorAll('.platform-dropdown a').forEach((link) => link.addEventListener('click', () => {
      groups.forEach((group) => { group.open = false; });
      button.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    }));
    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        const openGroup = groups.find((group) => group.open);
        groups.forEach((group) => { group.open = false; });
        if (nav.classList.contains('open')) {
          nav.classList.remove('open');
          button.setAttribute('aria-expanded', 'false');
          button.focus();
        } else {
          openGroup?.querySelector('summary')?.focus();
        }
      }
    });
    document.addEventListener('click', (event) => {
      const path = event.composedPath();
      if (!groups.some((group) => path.includes(group))) {
        groups.forEach((group) => { group.open = false; });
      }
    });
  }

  attributeChangedCallback(name, _previous, current) {
    if (name === 'version' && this.shadowRoot) {
      this.shadowRoot.querySelectorAll('[data-version]').forEach((element) => {
        element.textContent = `v${current || '0.0.0'}`;
      });
    }
  }
}

if (!customElements.get('validation-platform-shell')) {
  customElements.define('validation-platform-shell', ValidationPlatformShell);
}
