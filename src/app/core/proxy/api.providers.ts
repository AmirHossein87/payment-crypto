import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  API_BASE_URL,
  AppsClient,
  HostedPageClient,
  PaymentsClient,
  SystemClient,
  TeamClient,
  AuthenticationClient,
} from './proxy'; // Import from your generated file

/**
 * Provides the API base URL token using the active environment.
 */
export const provideApiBaseUrl = () => ({
  provide: API_BASE_URL,
  useValue: environment.baseUrl,
});

/**
 * Provides all NSwag-generated API clients.
 */
export const provideApiClients = (): EnvironmentProviders => {
  return makeEnvironmentProviders([
    AppsClient,
    HostedPageClient,
    PaymentsClient,
    SystemClient,
    TeamClient,
    AuthenticationClient,
  ]);
};
