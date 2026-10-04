import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AuthService } from "src/app/shared/services/auth.service";
import { getAccessToken } from "../config/api-config";

@Injectable({
  providedIn: "root",
})
export class SessionGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    if (getAccessToken()) {
      return of(true);
    }
    if (!this.authService.canEnterAsDemo()) {
      return of(this.toLogin());
    }
    return this.authService.loginAsDemo().pipe(
      map(() => true),
      catchError(() => of(this.toLogin()))
    );
  }

  // Navigated to rather than returned as a UrlTree: this router ignores a redirect to the page
  // it is already on, which would leave the refused URL in the address bar after a Back
  private toLogin(): boolean {
    this.router.navigate(["/login"]);
    return false;
  }
}
