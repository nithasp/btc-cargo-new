import { Component } from "@angular/core";
import { Lang } from "../../models/language.model";
import { LanguageService } from "../../services/language.service";

@Component({
  selector: "app-language-switch",
  templateUrl: "./language-switch.component.html",
  styleUrls: ["./language-switch.component.scss"],
})
export class LanguageSwitchComponent {
  constructor(private languageService: LanguageService) {}

  get currentLang(): string {
    return this.languageService.currentLang;
  }

  toggleLang(lang: Lang) {
    this.languageService.switchLanguage(lang);
  }
}
