import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { RecaptchaErrorParameters } from "ng-recaptcha"
import { environment } from "src/environments/environment"
import {
  ApiService,
  AuthService,
  clearStorageKeepingLanguage,
} from "../../services"
import { TranslocoService } from "@ngneat/transloco"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  baseUrl: string = this.apiService.baseUrl
  focus: boolean = false
  focus1: boolean = false
  focus2: boolean = false
  loginForm!: FormGroup
  hasUser: boolean = true
  rememberMeStatus: boolean = false
  showPassword1: boolean = false

  isLoginSuccess: boolean = false
  loginMsg: string = ""
  isMsgBoxDisplay: boolean = false
  newRegisterMsg: boolean = false
  userInfo: any

  demoEnabled: boolean = environment.autoDemoLogin
  isDemoLoading: boolean = false

  captcha: string = ""
  // Temporarily disable recaptcha validation
  isReCaptchaActive: boolean = true

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    // Subscribe Global Variables
    this.subscribeGlobalVariables()

    this.checkRememberMeStatus()
    this.checkUser()
    this.loginFormInit()
  }

  // Google reCAPTCHA
  resolved(captchaResponse: any) {
    this.captcha = captchaResponse
    this.isReCaptchaActive = true
    console.log("resolved captcha with response: " + this.captcha)
  }
  onError(errorDetails: RecaptchaErrorParameters): void {
    console.log(`reCAPTCHA error encountered; details:`, errorDetails)
  }

  loginFormInit() {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      email: [""],
      password: ["", Validators.required],
      //recaptchaReactive: new FormControl(null, Validators.required),
    })
  }

  signIn() {
    const loginFormValue = {
      username: this.loginForm.value["username"].replace(/\s/g, ""),
      password: this.loginForm.value["password"].replace(/\s/g, ""),
    }

    if (this.loginForm.valid) {
      this.http
        .post<any>(`${this.baseUrl}/api/login/`, loginFormValue)
        .subscribe(
          (res) => {
            if (res) {
              this.authService.isMsgBoxDisplay.next(true)
              this.authService.isLoginSuccess.next(true)
              this.authService.loginMsg.next(
                this.transloco.translate("auth.login_success")
              )

              if (this.rememberMeStatus) {
                localStorage.setItem("rememberMe", "true")
              } else {
                localStorage.setItem("rememberMe", "false")
              }

              const key = res.key
              localStorage.setItem("accessToken", key)

              setTimeout(() => {
                this.router.navigate(["/web"])
              }, 2000)
            }
          },
          (err) => {
            console.log("Something went wrong!", err.error, err)

            this.authService.isMsgBoxDisplay.next(true)
            this.authService.isLoginSuccess.next(false)
            this.authService.loginMsg.next(
              this.transloco.translate("auth.login_failed")
            )
            this.newRegisterMsg = true
          }
        )
    } else {
      this.authService.isMsgBoxDisplay.next(true)
      this.authService.isLoginSuccess.next(false)
      this.authService.loginMsg.next(this.transloco.translate("auth.fill_all_fields"))
      this.newRegisterMsg = false
    }
  }

  enterDemo() {
    if (this.isDemoLoading) {
      return
    }
    this.isDemoLoading = true

    this.authService.loginAsDemo().subscribe(
      () => {
        this.router.navigate(["/web"])
      },
      (err) => {
        console.log("Something went wrong!", err.error, err)

        this.authService.isMsgBoxDisplay.next(true)
        this.authService.isLoginSuccess.next(false)
        this.authService.loginMsg.next(
          this.transloco.translate("auth.demo_unavailable")
        )
        this.newRegisterMsg = false
        this.isDemoLoading = false
      }
    )
  }

  checkUser() {
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken) {
      const httpHeadersValue = new HttpHeaders({
        "content-type": "application/json",
        Authorization: `Token ${accessToken}`,
      })
      this.http
        .get<any>(`${this.baseUrl}/api/user/`, {
          headers: httpHeadersValue,
        })
        .subscribe(
          (res) => {
            this.router.navigate(["/web"])
          },
          (err) => {
            console.log(err, err.error.detail)
            this.hasUser = false
          }
        )
    } else {
      this.hasUser = false
    }
  }

  toggleRememberMe() {
    this.authService.rememberMeStatus.next(
      !this.authService.rememberMeStatus["_value"]
    )
  }

  checkRememberMeStatus() {
    const status = JSON.parse(localStorage.getItem("rememberMe"))
    if (!status) {
      clearStorageKeepingLanguage()
      this.authService.isMsgBoxDisplay.next(false)
    }
  }

  subscribeGlobalVariables() {
    this.authService
      .getRememberMeStatus()
      .subscribe((value) => (this.rememberMeStatus = value))

    this.authService
      .getIsLoginSuccess()
      .subscribe((value) => (this.isLoginSuccess = value))

    this.authService.getLoginMsg().subscribe((value) => (this.loginMsg = value))

    this.authService
      .getIsMsgBoxDisplay()
      .subscribe((value) => (this.isMsgBoxDisplay = value))
  }
}
