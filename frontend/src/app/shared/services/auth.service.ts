import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, Subject, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { SocialAuthService } from "angularx-social-login";
import { environment } from "../../../environments/environment";
import { btcBaseUrl, getAccessToken, getHttpHeadersValue } from "./config";
import { clearStorageKeepingLanguage } from "./language.service";

const DEMO_OPT_OUT_KEY = "demoEntryDeclined";

// Signing out keeps the login page through a refresh, but a tab that is opened again is a new
// visit. sessionStorage alone cannot tell the two apart: a browser brings it back when it reopens
// a closed tab
function isTabRefresh(): boolean {
  return performance
    .getEntriesByType("navigation")
    .some((entry) => (entry as PerformanceNavigationTiming).type === "reload");
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  userInfo = new BehaviorSubject<any>(null);
  userId = new BehaviorSubject<number>(-1);
  rememberMeStatus = new BehaviorSubject<boolean>(false);
  isLoginSuccess = new BehaviorSubject<boolean>(false);
  loginMsg = new BehaviorSubject<string>("");
  isMsgBoxDisplay = new BehaviorSubject<boolean>(false);
  sessionReady = new Subject<void>();

  constructor(
    private socialAuthService: SocialAuthService,
    private router: Router,
    private http: HttpClient
  ) {
    if (!isTabRefresh()) {
      sessionStorage.removeItem(DEMO_OPT_OUT_KEY);
    }
  }

  getUserInfo() {
    return this.userInfo.asObservable();
  }
  getRememberMeStatus() {
    return this.rememberMeStatus.asObservable();
  }
  getIsLoginSuccess() {
    return this.isLoginSuccess.asObservable();
  }
  getLoginMsg() {
    return this.loginMsg.asObservable();
  }
  getIsMsgBoxDisplay() {
    return this.isMsgBoxDisplay.asObservable();
  }
  getSessionReady() {
    return this.sessionReady.asObservable();
  }

  // Signing out declines the demo for this tab: a sign-out that walked straight back in would
  // not be one
  canEnterAsDemo(): boolean {
    return (
      environment.autoDemoLogin &&
      sessionStorage.getItem(DEMO_OPT_OUT_KEY) === null
    );
  }

  loginAsDemo(): Observable<void> {
    return this.http
      .post<{ key: string }>(`${btcBaseUrl}/api/auth/demo/`, null)
      .pipe(
        map((res) => {
          localStorage.setItem("accessToken", res.key);
          localStorage.setItem("rememberMe", "true");
          sessionStorage.removeItem(DEMO_OPT_OUT_KEY);
          this.sessionReady.next();
        })
      );
  }

  // The login page drops a session that was not saved with "remember me", so only a remembered
  // one is carried into the next visit
  resumeSession(): Observable<boolean> {
    if (localStorage.getItem("rememberMe") !== "true" || !getAccessToken()) {
      return of(false);
    }
    return this.http
      .get(`${btcBaseUrl}/api/user/`, { headers: getHttpHeadersValue() })
      .pipe(
        tap(() => this.sessionReady.next()),
        map(() => true),
        catchError(() => of(false))
      );
  }

  signOut(): void {
    this.http.post(`${btcBaseUrl}/api/auth/logout/`, null).subscribe(
      () => {},
      () => {}
    );
    this.socialAuthService.signOut();
    clearStorageKeepingLanguage();
    // Declined before navigating: the login route asks whether to enter the demo
    sessionStorage.setItem(DEMO_OPT_OUT_KEY, "1");
    this.router.navigate([""]);
  }
}
