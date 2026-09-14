import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { MockAuthService } from './core/services/mock-auth.service';
import { EngineService } from './core/services/engine.service';
import { HttpEngineService } from './core/services/http-engine.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: AuthService, useClass: MockAuthService },
    { provide: EngineService, useClass: HttpEngineService }
  ]
};



