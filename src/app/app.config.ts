import {
  APP_INITIALIZER,
  EnvironmentProviders,
  ErrorHandler,
  importProvidersFrom,
  ApplicationConfig,
} from '@angular/core';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import { routes } from './app.routes';
import { GlobalErrorHandlerService } from './core/error-handling/global-error-handler.service';
import {
  provideApiBaseUrl,
  provideApiClients,
} from './core/proxy/api.providers';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { provideTranslations } from './core/translation/translation.providers';
import { TranslationsService } from './core/translation/translations.service';

/**
 * Factory function to initialize the TranslationService before the app starts.
 */
export function initializeTranslations(
  translationsService: TranslationsService
): () => void {
  return () => translationsService.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Core Angular & Ionic
    provideRouter(routes),
    provideIonicAngular({
      mode: 'md', // Material Design mode
    }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    // HTTP Client & Interceptors
    provideHttpClient(withInterceptors([apiInterceptor])),

    // Global Error Handling
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService },

    // API Proxy Layer (from Step 4)
    provideApiBaseUrl(),
    provideApiClients(),

    // Translation (from Step 5)
    provideTranslations(),

    // App Initializer for Translations
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslations,
      deps: [TranslationsService, HttpClient], // Ensure HttpClient is available
      multi: true,
    },
  ],
};
