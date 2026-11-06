import { Component, Input } from '@angular/core';
import { InfoSidebarComponent, SidebarMode } from '../info-sidebar/info-sidebar.component';

@Component({
  selector: 'app-auth-layout',
  imports: [InfoSidebarComponent],
  template: `
    <div class="auth-page-layout">
      <div class="sidebar-column"><app-info-sidebar [mode]="mode" /></div>
      <main class="form-column"><ng-content /></main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .auth-page-layout { display: flex; min-height: 100vh; width: 100%; background: var(--mapa-page-background); }
    .sidebar-column { flex: 1; max-width: 580px; display: flex; flex-direction: column; justify-content: center; padding: 2.5rem; }
    .form-column { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2.5rem; position: relative; }
    @media (max-width: 991px) {
      .auth-page-layout { flex-direction: column; }
      .sidebar-column { max-width: 100%; padding: 1.5rem; }
      .form-column { padding: 1.5rem; }
    }
  `]
})
export class AuthLayoutComponent {
  @Input() mode: SidebarMode = 'login';
}
