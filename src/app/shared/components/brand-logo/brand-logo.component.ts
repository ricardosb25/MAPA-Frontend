import { Component, Input } from '@angular/core';

export type BrandLogoVariant = 'sidebar' | 'navbar';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  template: `
    <div class="brand-logo-container" [class.brand-logo-navbar]="variant === 'navbar'">
      <div class="logo-icon-badge">
        <i class="fa-solid fa-gauge-high logo-icon"></i>
      </div>
      <div class="brand-text-container">
        <span class="brand-main-title">MAPA</span>
        <span class="brand-sub-title">MOTOR ANALYSIS ACADEMY</span>
      </div>
    </div>
  `,
  styles: [`
    .brand-logo-container {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      user-select: none;
    }

    .logo-icon-badge {
      width: 44px;
      height: 44px;
      background-color: var(--color-primary, #0099ff);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-on-primary, #ffffff);
      font-size: 1.35rem;
      box-shadow: 0 4px 10px rgba(0, 153, 255, 0.25);
    }

    .brand-text-container {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .brand-main-title {
      font-size: 1.35rem;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: #0f172a;
    }

    .brand-sub-title {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #64748b;
      text-transform: uppercase;
    }

    .brand-logo-navbar {
      gap: 10px;
    }

    .brand-logo-navbar .logo-icon-badge {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      font-size: 1rem;
      box-shadow: none;
    }

    .brand-logo-navbar .brand-main-title {
      font-size: 1.15rem;
    }

    @media (max-width: 992px) {
      .brand-logo-navbar .brand-sub-title {
        display: none;
      }
    }
  `]
})
export class BrandLogoComponent {
  @Input() variant: BrandLogoVariant = 'sidebar';
}
