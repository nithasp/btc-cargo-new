import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";
import { SocialAuthService } from "angularx-social-login";

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

  constructor(
    private socialAuthService: SocialAuthService,
    private router: Router
  ) {}

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

  signOut(): void {
    this.socialAuthService.signOut();
    localStorage.clear();
    this.router.navigate([""]);
  }
}
