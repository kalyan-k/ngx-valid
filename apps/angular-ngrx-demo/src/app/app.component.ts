import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  readonly links = {
    portal: 'http://127.0.0.1:4200',
    docs: 'http://127.0.0.1:4201/docs/ngrx',
    angular: 'http://127.0.0.1:4202'
  };
  readonly currentYear = new Date().getFullYear();
}
