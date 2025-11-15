import { HttpClient } from '@angular/common/http';
import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { createTranslateLoader } from './custom-translations-loader.service';

/**
 * Provides @ngx-translate services.
 * To be used in app.config.ts
 */
export const provideTranslations = (): EnvironmentProviders => {
  return importProvidersFrom(
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    })
  );
};
