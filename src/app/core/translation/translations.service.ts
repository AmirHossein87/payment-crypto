import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../logger/logger.service';

/**
 * Wrapper for @ngx-translate to manage app language.
 */
@Injectable({
  providedIn: 'root',
})
export class TranslationsService {
  private readonly defaultLang = 'en';

  constructor(
    private readonly translate: TranslateService,
    private readonly logger: LoggerService
  ) {}

  /**
   * Initializes the translation service.
   * Sets the default language and attempts to use the browser language.
   */
  public initialize(): void {
    this.translate.setDefaultLang(this.defaultLang);

    const browserLang = this.translate.getBrowserLang();
    if (browserLang) {
      this.translate.use(browserLang.match(/en|es|fr/) ? browserLang : this.defaultLang);
    } else {
      this.translate.use(this.defaultLang);
    }

    //this.logger.log(`Translation service initialized. Using language: ${this.translate.currentLang}`);
  }

  /**
   * Gets the current active language.
   */
  public getCurrentLang(): string {
    return this.translate.currentLang;
  }

  /**
   * Changes the active language.
   * @param lang The language code (e.g., 'en', 'es').
   */
  public setLanguage(lang: string): void {
    this.translate.use(lang);
    this.logger.log(`Language changed to: ${lang}`);
  }
}
