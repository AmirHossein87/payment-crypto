import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

/**
 * Custom loader for @ngx-translate to load JSON files from assets/i18n/
 */
export class CustomTranslationsLoaderService implements TranslateLoader {
  constructor(private readonly http: HttpClient) {}

  public getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`);
  }
}

// Factory function for AOT compilation
export function createTranslateLoader(http: HttpClient) {
  return new CustomTranslationsLoaderService(http);
}
