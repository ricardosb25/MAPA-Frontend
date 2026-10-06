import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserProfileType } from './core/models/user-profile.enum';

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
    path: 'classes',
    canActivate: [authGuard, roleGuard([UserProfileType.TEACHER])],
    loadComponent: () =>
      import('./features/classes/pages/classes-page/classes-page.component').then((module) => module.ClassesPageComponent)
  },
  {
    path: 'my-classes',
    canActivate: [authGuard, roleGuard([UserProfileType.STUDENT])],
    loadComponent: () =>
      import('./features/classes/pages/my-classes-page/my-classes-page.component').then(
        (module) => module.MyClassesPageComponent
      )
  },
  {
    path: 'users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/users/pages/users-page/users-page.component').then((module) => module.UsersPageComponent)
  },
  {
    path: 'logs',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/logs/pages/logs-page/logs-page.component').then((module) => module.LogsPageComponent)
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