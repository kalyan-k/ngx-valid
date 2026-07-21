export function renderMarkdown(markdown: string): string {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const output: string[] = [];
  let paragraph: string[] = [];
  let listType: 'ul' | 'ol' | undefined;
  let codeLanguage = '';
  let codeLines: string[] | undefined;

  const flushParagraph = (): void => {
    if (paragraph.length > 0) {
      output.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const closeList = (): void => {
    if (listType) {
      output.push(`</${listType}>`);
      listType = undefined;
    }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      flushParagraph();
      closeList();
      if (codeLines) {
        output.push(`<pre><code${codeLanguage ? ` data-language="${escapeHtml(codeLanguage)}"` : ''}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        codeLines = undefined;
        codeLanguage = '';
      } else {
        codeLanguage = line.slice(3).trim();
        codeLines = [];
      }
      continue;
    }
    if (codeLines) {
      codeLines.push(line);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1]?.length ?? 2;
      const text = heading[2] ?? '';
      output.push(`<h${level} id="${slugify(text)}">${inline(text)}</h${level}>`);
      continue;
    }

    const unordered = /^[-*]\s+(.+)$/.exec(line);
    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? 'ul' : 'ol';
      if (listType !== nextType) {
        closeList();
        listType = nextType;
        output.push(`<${nextType}>`);
      }
      output.push(`<li>${inline((unordered ?? ordered)?.[1] ?? '')}</li>`);
      continue;
    }

    if (line.startsWith('> ')) {
      flushParagraph();
      closeList();
      output.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
      continue;
    }
    paragraph.push(line.trim());
  }

  flushParagraph();
  closeList();
  if (codeLines) {
    output.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  }
  return output.join('\n');
}

function inline(value: string): string {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label: string, href: string) => {
      const safeHref = /^(?:https?:\/\/|\/|#)/.test(href) ? href : '#';
      return `<a href="${escapeHtml(safeHref)}">${label}</a>`;
    });
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
