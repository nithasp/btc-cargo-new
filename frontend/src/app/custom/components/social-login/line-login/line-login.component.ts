import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/custom/services/auth.service";
import { ApiService } from "src/app/custom/services/api.service";
import { HttpClient } from "@angular/common/http";
import liff from "@line/liff";

@Component({
  selector: "app-line-login",
  templateUrl: "./line-login.component.html",
  styleUrls: ["./line-login.component.scss"],
})
export class LineLoginComponent implements OnInit {
  baseUrl: string = this.apiService.baseUrl;
  title = "angular-line-login";
  liffId: any = "1656798245-ZM8GJrRA";
  rememberMeStatus: boolean = false;
  isLoginSuccess: boolean = false;
  loginMsg: string = "";
  isMsgBoxDisplay: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.subscribeGlobalVariables();
    this.isLineLogin();
  }

  initLine(): void {
    liff.init(
      { liffId: this.liffId },
      () => {
        if (liff.isLoggedIn()) {
          this.runApp();
        } else {
          liff.login();
        }
      },
      (err) => console.error(err)
    );
  }

  lineLogin(): void {
    liff.init(
      { liffId: this.liffId },
      () => {
        localStorage.setItem("rememberMe", "true");
        liff.login();
      },
      (err) => {
        console.error(err);
        this.showFailedLoginMsg();
      }
    );
  }

  isLineLogin(): void {
    liff.init({ liffId: this.liffId }, () => {
      if (liff.isLoggedIn()) {
        this.runApp();
      }
    });
  }

  runApp(): void {
    const idToken = liff.getIDToken();
    const accessTokenLine = liff.getAccessToken();
    this.getAccessTokenFromLine(accessTokenLine, idToken);
    liff
      .getProfile()
      .then((profile) => {
        console.log(profile);
      })
      .catch((err) => console.error(err));
  }

  logout(): void {
    liff.logout();
    window.location.reload();
  }

  getAccessTokenFromLine(accessTokenLine: any, idToken: any) {
    this.http
      .post<any>(`${this.baseUrl}/api/auth/line`, {
        access_token: accessTokenLine,
        id_token: idToken,
      })
      .subscribe(
        (res) => {
          const accessToken = res.key;
          localStorage.setItem("accessToken", accessToken);

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
      "เกิดข้อผิดพลาดในการเข้าสู่ระบบ ลองเข้าสู่ระบบใหม่อีกครั้ง หรือลองลบ Cookies แล้วเข้าสู่ระบบใหม่"
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
