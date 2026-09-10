import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { MockAuthService } from './core/services/mock-auth.service';
import { EngineService } from './core/services/engine.service';
import { MockEngineService } from './core/services/mock-engine.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: AuthService, useClass: MockAuthService },
    { provide: EngineService, useClass: MockEngineService }
  ]
};


