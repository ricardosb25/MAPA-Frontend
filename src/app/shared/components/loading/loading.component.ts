import { Component, Input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

export type LoadingVariant = 'page' | 'section' | 'inline';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [ProgressSpinnerModule],
  template: `
    <div
      class="loading-container"
      [class.loading-page]="variant === 'page'"
      [class.loading-inline]="variant === 'inline'"
      role="status"
      aria-live="polite"
    >
      <p-progressSpinner
        styleClass="loading-spinner"
        strokeWidth="4"
        animationDuration="1s"
        aria-hidden="true"
      ></p-progressSpinner>
      <span class="loading-message">{{ message }}</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 48px 24px;
        background-color: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 12px;
        color: #0099ff;
      }

      .loading-container.loading-page {
        min-height: 50vh;
        padding: 5rem 24px;
        background-color: transparent;
        border: none;
      }

      .loading-container.loading-inline {
        flex-direction: row;
        gap: 10px;
        padding: 16px 8px;
        background-color: transparent;
        border: none;
      }

      .loading-message {
        font-size: 0.875rem;
        font-weight: 600;
        color: #475569;
        text-align: center;
      }

      .loading-container.loading-inline .loading-message {
        font-size: 0.8125rem;
      }

      :host ::ng-deep .loading-spinner {
        width: 48px;
        height: 48px;
      }

      :host ::ng-deep .loading-container.loading-inline .loading-spinner {
        width: 26px;
        height: 26px;
      }

      @media (prefers-reduced-motion: reduce) {
        :host ::ng-deep .p-progressspinner-circle {
          animation: none;
        }
      }
    `
  ]
})
export class LoadingComponent {
  @Input() message = 'Carregando...';
  @Input() variant: LoadingVariant = 'section';
}
