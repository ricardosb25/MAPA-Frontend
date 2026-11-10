import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { routes } from './app.routes';
import { AccountSettingsService } from './core/services/account-settings.service';
import { HttpAccountSettingsService } from './core/services/http-account-settings.service';
import { BaseRestorationService } from './core/services/base-restoration.service';
import { HttpBaseRestorationService } from './core/services/http-base-restoration.service';
import { TeacherDashboardService } from './core/services/teacher-dashboard.service';
import { HttpTeacherDashboardService } from './core/services/http-teacher-dashboard.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AdminUserService } from './core/services/admin-user.service';
import { AuditLogService } from './core/services/audit-log.service';
import { AuthService } from './core/services/auth.service';
import { EngineService } from './core/services/engine.service';
import { HttpAdminUserService } from './core/services/http-admin-user.service';
import { HttpAuditLogService } from './core/services/http-audit-log.service';
import { HttpAuthService } from './core/services/http-auth.service';
import { HttpEngineService } from './core/services/http-engine.service';
import { HttpClassService } from './core/services/http-class.service';
import { ClassService } from './core/services/class.service';
import { EcuMapService } from './core/services/ecu-map.service';
import { HttpEcuMapService } from './core/services/http-ecu-map.service';
import { DynoService } from './core/services/dyno.service';
import { HttpDynoService } from './core/services/http-dyno.service';
import { ChallengeService } from './core/services/challenge.service';
import { HttpChallengeService } from './core/services/http-challenge.service';

const MapaThemePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: 'var(--mapa-blue-50)',
      100: 'var(--mapa-blue-100)',
      200: 'var(--mapa-blue-200)',
      300: 'var(--mapa-blue-300)',
      400: 'var(--mapa-blue-400)',
      500: 'var(--mapa-blue-500)',
      600: 'var(--mapa-blue-600)',
      700: 'var(--mapa-blue-700)',
      800: 'var(--mapa-blue-800)',
      900: 'var(--mapa-blue-900)',
      950: 'var(--mapa-blue-950)',
      color: 'light-dark({primary.500}, {primary.400})',
      contrastColor: 'light-dark(#ffffff, {surface.900})',
      hoverColor: 'light-dark({primary.600}, {primary.300})',
      activeColor: 'light-dark({primary.700}, {primary.200})'
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: TeacherDashboardService, useClass: HttpTeacherDashboardService },
    { provide: AccountSettingsService, useClass: HttpAccountSettingsService },
    { provide: BaseRestorationService, useClass: HttpBaseRestorationService },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled' })),
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: MapaThemePreset, options: { darkModeSelector: 'none' } } }),
    provideHttpClient(withInterceptors([authInterceptor])),
    MessageService,
    { provide: AuthService, useClass: HttpAuthService },
    { provide: EngineService, useClass: HttpEngineService },
    { provide: AuditLogService, useClass: HttpAuditLogService },
    { provide: AdminUserService, useClass: HttpAdminUserService },
    { provide: ClassService, useClass: HttpClassService },
    { provide: EcuMapService, useClass: HttpEcuMapService },
    { provide: DynoService, useClass: HttpDynoService },
    { provide: ChallengeService, useClass: HttpChallengeService }
  ]
};

