import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { AuthService } from "src/app/shared/services/auth.service";

// LINE sends the visitor back to the login page with these, and its sign-in finishes there:
// entering the demo first would drop it
const LINE_SIGN_IN_PARAMS = ["liffClientId", "liff.state"];

@Injectable({
  providedIn: "root",
})
export class GuestGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const signingInWithLine = LINE_SIGN_IN_PARAMS.some((name) =>
      route.queryParamMap.has(name)
    );
    if (signingInWithLine || !this.authService.canEnterAsDemo()) {
      return of(true);
    }

    const home = this.router.createUrlTree(["/web"]);
    return this.authService.resumeSession().pipe(
      switchMap((resumed) =>
        resumed
          ? of(home)
          : this.authService.loginAsDemo().pipe(map(() => home))
      ),
      catchError(() => of(true))
    );
  }
}
