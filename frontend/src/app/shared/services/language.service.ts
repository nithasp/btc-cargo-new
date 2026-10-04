import { Injectable } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";

export type Lang = "en" | "th";

const LANG_KEY = "lang";

export const clearStorageKeepingLanguage = (): void => {
  const saved = localStorage.getItem(LANG_KEY);
  localStorage.clear();
  if (saved) {
    localStorage.setItem(LANG_KEY, saved);
  }
};

@Injectable({
  providedIn: "root",
})
export class LanguageService {
  constructor(private transloco: TranslocoService) {}

  get currentLang(): string {
    return this.transloco.getActiveLang();
  }

  applySavedLanguage(): void {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "th") {
      this.transloco.setActiveLang(saved);
    }
  }

  switchLanguage(lang: Lang): void {
    this.transloco.setActiveLang(lang);
    localStorage.setItem(LANG_KEY, lang);
  }
}
