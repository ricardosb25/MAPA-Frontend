import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserProfileType } from '../models/user-profile.enum';
import { AuthService } from '../services/auth.service';

export const roleGuard =
  (allowedRoles: UserProfileType[]): CanActivateFn =>
  () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      authService.logout();
      return router.createUrlTree(['/login']);
    }

    const currentRole = authService.getRole();
    if (currentRole === null || !allowedRoles.includes(currentRole)) {
      return router.createUrlTree(['/garage']);
    }

    return true;
  };
