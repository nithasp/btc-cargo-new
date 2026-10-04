import { Component } from "@angular/core";
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { LanguageService } from "./shared/services/language.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {

  constructor(private router: Router, private languageService: LanguageService) {
     this.languageService.applySavedLanguage();

     this.router.events.subscribe((event: Event) => {
         if (event instanceof NavigationStart) {
             window.scrollTo(0,0);
         }

         if (event instanceof NavigationEnd) {
         }

         if (event instanceof NavigationError) {
             console.log(event.error);
         }
     });
   }

}
