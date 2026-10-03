import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { RecaptchaErrorParameters } from "ng-recaptcha"
import { ApiService, AuthService } from "../../services"

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

  captcha: string = ""
  // Temporarily disable recaptcha validation
  isReCaptchaActive: boolean = true

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService
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
                "เข้าสู่ระบบสำเร็จ เรากำลังจะพาคุณไปยังหน้า Dashboard"
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
              "บัญชีนี้ไม่มีอยู่ในระบบ หรือรหัสผ่านไม่ถูกต้อง ลองใส่บัญชีอื่นหรือ"
            )
            this.newRegisterMsg = true
          }
        )
    } else {
      this.authService.isMsgBoxDisplay.next(true)
      this.authService.isLoginSuccess.next(false)
      this.authService.loginMsg.next("กรุณากรอกข้อมูลให้ครบทุกช่อง")
      this.newRegisterMsg = false
    }
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
      localStorage.clear()
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
