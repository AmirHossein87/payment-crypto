import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Skeleton wrapper for all logging-related logic.
 * In a real-world app, this would use a third-party logging
 * service (e.g., Sentry, Azure App Insights) in production.
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  public log(message: string, ...optionalParams: any[]): void {
    if (!environment.production) {
      console.log(`[LOG] ${message}`, ...optionalParams);
    }
  }

  public warn(message: string, ...optionalParams: any[]): void {
    if (!environment.production) {
      console.warn(`[WARN] ${message}`, ...optionalParams);
    }
  }

  public error(message: string, error?: any, ...optionalParams: any[]): void {
    // Always log errors
    console.error(`[ERROR] ${message}`, error, ...optionalParams);

    // In a production environment, send this to a logging service
    // e.g., this.loggingProvider.logError(error, { message, ...optionalParams });
  }
}
