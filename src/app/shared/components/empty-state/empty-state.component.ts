import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <section class="empty-state">
      <i [class]="icon" aria-hidden="true"></i>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <ng-content />
    </section>
  `,
  styles: [`
    :host { display: block; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 56px 24px; background: var(--mapa-gray-50); border: 1px dashed var(--mapa-gray-300); border-radius: var(--mapa-radius-card); text-align: center; }
    i { font-size: 2rem; color: var(--mapa-blue-500); }
    h2 { margin: 0; font-size: 1.1rem; color: var(--mapa-ink); }
    p { margin: 0; max-width: 520px; font-size: .875rem; line-height: 1.6; color: var(--mapa-gray-500); }
  `]
})
export class EmptyStateComponent {
  @Input({ required: true }) title!: string;
  @Input() description = '';
  @Input() icon = 'pi pi-inbox';
}
