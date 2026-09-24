import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login-page/login-page.component').then((module) => module.LoginPageComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/register-page/register-page.component').then((module) => module.RegisterPageComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/pages/forgot-password-page/forgot-password-page.component').then(
        (module) => module.ForgotPasswordPageComponent
      )
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/pages/reset-password-page/reset-password-page.component').then(
        (module) => module.ResetPasswordPageComponent
      )
  },
  {
    path: 'garage',
    canActivate: [authGuard],
    loadComponent: () => import('./features/garage/pages/garage-catalog-page/garage-catalog-page.component').then((module) => module.GarageCatalogPageComponent)
  },
  {
    path: 'catalog',
    redirectTo: 'garage',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
