import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  if (!authService.isAdmin()) {
    return router.createUrlTree(['/garage']);
  }

  return true;
};