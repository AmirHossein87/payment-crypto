import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../toast/toast.service';
import { LoggerService } from '../logger/logger.service';
import { Router } from '@angular/router';

// This is a functional interceptor, the modern Angular standard.

/**
 * Intercepts HTTP requests to handle errors and add headers.
 */
export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const toastService = inject(ToastService);
  const logger = inject(LoggerService);
  const router = inject(Router);

  // 1. Add any necessary headers (e.g., Authorization)
  // const authService = inject(AuthService);
  // const token = authService.getToken();
  // if (token) {
  //   req = req.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   });
  // }

  // 2. Pass the request and handle errors
  return next(req).pipe(
    catchError((error) => {
      // The GlobalErrorHandler will catch this, but we can
      // handle specific interceptor-level logic here, like 401/403.

      if (error.status === 401) {
        // Unauthorized
        logger.warn('Unauthorized request. Redirecting to login.', error);
        toastService.presentError('Your session has expired. Please log in.');
        router.navigate(['/login']); // Assuming you have a '/login' route
      } else if (error.status === 403) {
        // Forbidden
        logger.warn('Forbidden request.', error);
        toastService.presentInfo("You don't have permission to do that.");
      }

      // Re-throw the error to be handled by other services
      // (like the GlobalErrorHandler)
      return throwError(() => error);
    })
  );
};
