import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { SocialAuthService, GoogleLoginProvider } from "angularx-social-login";
import { AuthService } from "src/app/custom/services/auth.service";
import { ApiService } from "src/app/custom/services/api.service";

@Component({
  selector: "app-google-login",
  templateUrl: "./google-login.component.html",
  styleUrls: ["./google-login.component.scss"],
})
export class GoogleLoginComponent implements OnInit {
  baseUrl: string = this.apiService.baseUrl;
  rememberMeStatus: boolean = false;
  isLoginSuccess: boolean = false;
  loginMsg: string = "";
  isMsgBoxDisplay: boolean = false;

  constructor(
    private socialAuthService: SocialAuthService,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.subscribeGlobalVariables();
  }

  signInWithGoogle(): void {
    this.socialAuthService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((res) => {
        if (res) {
          const authToken = res.authToken;
          this.getAccessTokenFromGoogle(authToken);
        } else {
          console.log("Something went wrong");
        }
      })
      .catch((err) => {
        console.log(err);
        this.showFailedLoginMsg();
      });
  }

  getAccessTokenFromGoogle(authToken: any) {
    this.http
      .post<any>(`${this.baseUrl}/api/auth/google`, {
        access_token: authToken,
      })
      .subscribe(
        (res) => {
          const accessToken = res.key;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("rememberMe", "true");
          this.showSuccessfulLoginMsg();

          setTimeout(() => {
            this.router.navigate(["/web"]);
          }, 2000);
        },
        (err) => {
          console.log(err);
          this.showFailedLoginMsg();
        }
      );
  }

  showSuccessfulLoginMsg() {
    this.authService.isMsgBoxDisplay.next(true);
    this.authService.isLoginSuccess.next(true);
    this.authService.loginMsg.next(
      "เข้าสู่ระบบสำเร็จ เรากำลังจะพาคุณไปยังหน้า Dashboard"
    );
  }
  showFailedLoginMsg() {
    this.authService.isMsgBoxDisplay.next(true);
    this.authService.isLoginSuccess.next(false);
    this.authService.loginMsg.next(
      "เกิดข้อผิดพลาดในการเข้าสู่ระบบ ลองเข้าสู่ระบบใหม่อีกครั้ง ถ้าเข้าไม่ได้ลองลบ Cookies แล้วเข้าสู่ระบบใหม่ หรือว่ายกเลิกการ Block third-party cookies ใน Incognito Mode"
    );
  }

  subscribeGlobalVariables() {
    this.authService
      .getRememberMeStatus()
      .subscribe((value) => (this.rememberMeStatus = value));

    this.authService
      .getIsLoginSuccess()
      .subscribe((value) => (this.isLoginSuccess = value));

    this.authService
      .getLoginMsg()
      .subscribe((value) => (this.loginMsg = value));

    this.authService
      .getIsMsgBoxDisplay()
      .subscribe((value) => (this.isMsgBoxDisplay = value));
  }
}
