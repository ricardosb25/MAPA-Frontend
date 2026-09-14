import { Component } from '@angular/core';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  template: `
    <div class="brand-logo-container">
      <div class="logo-icon-badge">
        <i class="pi pi-tachometer logo-icon"></i>
      </div>
      <span class="brand-text">MAPA.</span>
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
      background-color: #0099ff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(0, 153, 255, 0.25);
    }

    .logo-icon {
      font-size: 1.35rem;
    }

    .brand-text {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
    }
  `]
})
export class BrandLogoComponent {}
