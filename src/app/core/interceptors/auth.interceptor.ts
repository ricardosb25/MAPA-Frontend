import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { TokenStorageService } from '../services/token-storage.service';

function isPublicAuthRequest(request: HttpRequest<unknown>): boolean {
  return (
    request.url === API_CONFIG.endpoints.auth.login ||
    request.url === API_CONFIG.endpoints.auth.register ||
    request.url === API_CONFIG.endpoints.auth.forgotPassword ||
    request.url === API_CONFIG.endpoints.auth.resetPassword
  );
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);
  const storedToken = tokenStorage.getToken();

  const authenticatedRequest =
    storedToken && !isPublicAuthRequest(request)
      ? request.clone({ setHeaders: { Authorization: `Bearer ${storedToken}` } })
      : request;

  return next(authenticatedRequest).pipe(
    catchError((httpError: HttpErrorResponse) => {
      if (httpError.status === 401 && !isPublicAuthRequest(request)) {
        tokenStorage.clearSession();
        void router.navigate(['/login']);
      }
      return throwError(() => httpError);
    })
  );
};
