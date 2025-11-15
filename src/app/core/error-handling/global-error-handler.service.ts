import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerService } from '../logger/logger.service';
import { ToastService } from '../toast/toast.service';

/**
 * Global error handler that intercepts all unhandled exceptions.
 */
@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlerService implements ErrorHandler {
  // We use Injector to avoid a circular dependency
  // (e.g., if LoggerService itself throws an error)
  constructor(private readonly injector: Injector) {}

  public handleError(error: Error | HttpErrorResponse): void {
    const logger = this.injector.get(LoggerService);
    const toast = this.injector.get(ToastService);

    let message: string;
    let errorId: string = `err-${Date.now()}`;

    if (error instanceof HttpErrorResponse) {
      // API Error
      message = this.getApiErrorMessage(error);
      logger.error(`[API Error] ${error.message}`, error);
      toast.presentError(`API Error: ${message} (Ref: ${errorId})`);
    } else {
      // Client-side Error
      message = error.message ? error.message : error.toString();
      logger.error(`[Client Error] ${message}`, error);
      toast.presentError(`An unexpected error occurred. (Ref: ${errorId})`);
    }

    // In a real app, 'errorId' and the 'error' object would be sent
    // to your logging backend for debugging.
  }

  private getApiErrorMessage(error: HttpErrorResponse): string {
    // Try to parse the NSwag ApiException response
    try {
      const apiException = JSON.parse(error.error);
      if (apiException.Message) {
        return apiException.Message;
      }
    } catch (e) {
      // Not a standard NSwag exception, just return status text
    }

    if (error.status === 0) {
      return 'Could not connect to the server.';
    }

    return error.statusText || 'Unknown server error.';
  }
}
