import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';
import { EngineService } from './core/services/engine.service';
import { HttpAuthService } from './core/services/http-auth.service';
import { HttpEngineService } from './core/services/http-engine.service';

const MapaThemePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eef8ff',
      100: '#d9efff',
      200: '#bce4ff',
      300: '#8ed5ff',
      400: '#59bdff',
      500: '#0099ff',
      600: '#0088e6',
      700: '#0072c7',
      800: '#065ca0',
      900: '#0b4d80',
      950: '#072f4f',
      color: 'light-dark({primary.500}, {primary.400})',
      contrastColor: 'light-dark(#ffffff, {surface.900})',
      hoverColor: 'light-dark({primary.600}, {primary.300})',
      activeColor: 'light-dark({primary.700}, {primary.200})'
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: MapaThemePreset } }),
    provideHttpClient(withInterceptors([authInterceptor])),
    MessageService,
    { provide: AuthService, useClass: HttpAuthService },
    { provide: EngineService, useClass: HttpEngineService }
  ]
};



