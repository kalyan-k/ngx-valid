import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html'
})
export class HomeComponent {
  readonly examples = [
    {
      route: '/state',
      title: 'Pure NgRx State',
      description: 'Dispatch field edits directly to the store and validate a cloned state snapshot without Angular Forms.'
    },
    {
      route: '/reactive-forms',
      title: 'NgRx + Reactive Forms',
      description: 'Coordinate interaction state, a durable NgRx draft, dynamic controls, and reusable validation policies.'
    }
  ];

  readonly architecture = [
    { title: 'Application state', detail: 'NgRx owns serializable drafts, validated snapshots, and lifecycle status.' },
    { title: 'Interaction state', detail: 'DOM events or Reactive Forms own the immediate editing experience.' },
    { title: 'Validation state', detail: 'Validation Rules evaluates policies and returns structured model results.' }
  ];
}
