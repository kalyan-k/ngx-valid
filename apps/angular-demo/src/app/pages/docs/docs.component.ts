import { Component } from '@angular/core';
import { DOC_SECTIONS, DocSection } from './docs-sections';

@Component({
  selector: 'app-docs',
  standalone: false,
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.sass']
})
export class DocsComponent {
  readonly sections = DOC_SECTIONS;
  activeSectionId = DOC_SECTIONS[0].id;

  selectSection(section: DocSection): void {
    this.activeSectionId = section.id;
    const el = document.getElementById(`doc-${section.id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  isActive(sectionId: string): boolean {
    return this.activeSectionId === sectionId;
  }
}
