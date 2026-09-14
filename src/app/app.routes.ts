import { Routes } from '@angular/router';

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
    path: 'garage',
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
