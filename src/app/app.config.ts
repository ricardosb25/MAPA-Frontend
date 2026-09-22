import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';
import { EngineService } from './core/services/engine.service';
import { HttpAuthService } from './core/services/http-auth.service';
import { HttpEngineService } from './core/services/http-engine.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura } }),
    provideHttpClient(withInterceptors([authInterceptor])),
    MessageService,
    { provide: AuthService, useClass: HttpAuthService },
    { provide: EngineService, useClass: HttpEngineService }
  ]
};



