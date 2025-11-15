import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * A functional route guard to protect routes.
 * It checks the auth state from the AuthService.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // User is authenticated, allow access
  } else {
    // User is not authenticated, redirect to login
    return router.parseUrl('/login');
  }
};
