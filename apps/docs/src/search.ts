import type { DocumentationEntry } from './catalog.js';

export interface SearchDocument {
  id: string;
  slug: string;
  title: string;
  section: string;
  heading: string;
  anchor: string;
  excerpt: string;
  searchableText: string;
}

export interface SearchResult extends Omit<SearchDocument, 'searchableText'> {
  score: number;
}

export function buildSearchIndex(
  catalog: DocumentationEntry[],
  readSource: (entry: DocumentationEntry) => string
): SearchDocument[] {
  return catalog.flatMap((entry) => {
    const source = readSource(entry).replaceAll('\r\n', '\n');
    const lines = source.split('\n');
    const headings = lines.flatMap((line, index) => {
      const match = /^(#{1,4})\s+(.+)$/u.exec(line);
      return match ? [{ index, level: match[1]?.length ?? 1, text: cleanMarkdown(match[2] ?? '') }] : [];
    });
    const firstSectionIndex = headings.find(({ level }) => level > 1)?.index ?? lines.length;
    const pageHeadingIndex = headings.find(({ level }) => level === 1)?.index ?? -1;
    const pageIntroduction = cleanMarkdown(lines.slice(pageHeadingIndex + 1, firstSectionIndex).join('\n'));
    const pageDocument: SearchDocument = {
      id: `${entry.slug}:page`,
      slug: entry.slug,
      title: entry.title,
      section: entry.section,
      heading: entry.title,
      anchor: '',
      excerpt: entry.summary,
      searchableText: normalize(`${entry.title} ${entry.section} ${entry.summary} ${pageIntroduction}`)
    };
    const sectionDocuments = headings
      .map((heading, headingIndex) => ({ heading, headingIndex }))
      .filter(({ heading }) => heading.level > 1)
      .map(({ heading, headingIndex }): SearchDocument => {
        const next = headings.slice(headingIndex + 1).find(({ level }) => level <= heading.level);
        const sectionSource = lines.slice(heading.index + 1, next?.index ?? lines.length).join('\n');
        const content = cleanMarkdown(sectionSource);
        return {
          id: `${entry.slug}:${slugify(heading.text)}`,
          slug: entry.slug,
          title: entry.title,
          section: entry.section,
          heading: heading.text,
          anchor: slugify(heading.text),
          excerpt: excerpt(content || entry.summary),
          searchableText: normalize(`${entry.title} ${entry.section} ${heading.text} ${content}`)
        };
      });
    return [pageDocument, ...sectionDocuments];
  });
}

export function searchDocumentation(index: SearchDocument[], query: string, limit = 12): SearchResult[] {
  const terms = normalize(query).split(/\s+/u).filter(Boolean);
  if (terms.length === 0) {
    return [];
  }
  return index
    .map((document) => ({ ...document, score: scoreDocument(document, terms) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title) || left.heading.localeCompare(right.heading))
    .slice(0, limit)
    .map(({ searchableText: _searchableText, ...result }) => result);
}

function scoreDocument(document: SearchDocument, terms: string[]): number {
  const title = normalize(document.title);
  const heading = normalize(document.heading);
  const section = normalize(document.section);
  if (!terms.every((term) => document.searchableText.includes(term))) {
    return 0;
  }
  return terms.reduce((score, term) => score
    + (title === term ? 30 : title.includes(term) ? 14 : 0)
    + (heading === term ? 24 : heading.includes(term) ? 12 : 0)
    + (section.includes(term) ? 5 : 0)
    + occurrenceCount(document.searchableText, term), 0);
}

function cleanMarkdown(value: string): string {
  return value
    .replace(/^```[^\n]*$/gmu, ' ')
    .replace(/`([^`]+)`/gu, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/gu, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/gu, '$1')
    .replace(/[*_>#|]/gu, ' ')
    .replace(/^\s*(?:[-+] |\d+\. )/gmu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

function excerpt(value: string): string {
  return value.length <= 180 ? value : `${value.slice(0, 177).trimEnd()}…`;
}

function normalize(value: string): string {
  return value.toLocaleLowerCase().replace(/\s+/gu, ' ').trim();
}

function occurrenceCount(value: string, term: string): number {
  return value.split(term).length - 1;
}

function slugify(value: string): string {
  return normalize(value).replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '');
}
