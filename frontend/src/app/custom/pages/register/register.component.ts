import { HttpClient } from "@angular/common/http"
import { Component, OnInit } from "@angular/core"
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms"
import { Router } from "@angular/router"
import { ApiService } from "src/app/custom/services"

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  baseUrl: string = this.apiService.baseUrl
  focus
  focus1
  focus2
  focus3
  focus4
  registerForm!: FormGroup
  isMsgBoxDisplay: boolean = false
  isRegisterSuccess: boolean = false
  registerMsg: string = ""
  showPassword1: boolean = false
  showPassword2: boolean = false

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.registerFormInit()
  }

  registerFormInit() {
    this.registerForm = this.formBuilder.group(
      {
        username: [
          "",
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(16),
            Validators.pattern(
              /^(?![0-9]+$)[~`!@#$%^&*()_+=[\]\{}|;':",.\/<>?a-zA-Z0-9-]+$/
            ),
          ],
        ],
        email: [
          "",
          [
            Validators.required,
            Validators.pattern(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            ),
          ],
        ],
        password1: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(16),
            Validators.pattern(
              /^(?![0-9]+$)[~`!@#$%^&*()_+=[\]\{}|;':",.\/<>?a-zA-Z0-9-]+$/
            ),
          ],
        ],
        password2: ["", Validators.required],
        extendeduser: this.formBuilder.group({
          referralCode: [""],
        }),
      },
      {
        validators: [this.mustMatch],
      }
    )
  }

  register() {
    const registerFormValue = {
      ...this.registerForm.value,
      username: this.registerForm.value["username"].replace(/\s/g, ""),
      email: this.registerForm.value["email"].replace(/\s/g, ""),
      password1: this.registerForm.value["password1"].replace(/\s/g, ""),
      password2: this.registerForm.value["password2"].replace(/\s/g, ""),
      extendeduser: {
        referralCode: this.registerForm.value.extendeduser[
          "referralCode"
        ].replace(/\s/g, ""),
      },
    }

    if (this.registerForm.valid) {
      this.http
        .post<any>(`${this.baseUrl}/api/registration/`, registerFormValue)
        .subscribe(
          (res) => {
            const accessToken = res.key
            localStorage.setItem("accessToken", accessToken)
            this.isMsgBoxDisplay = true
            this.isRegisterSuccess = true
            this.registerMsg = "สมัครสมาชิกสำเร็จ เรากำลังจะพาคุณเข้าสู่ระบบ"
            this.registerForm.reset()
            this.router.navigate(["/pdpa-conditions"])
          },
          (err) => {
            console.log("register err", err)

            let invalidUsernameErrorMsg
            let usernameExists

            let numericPasswordErrMsg
            let commonPasswordErrMsg
            let tooShortPasswordErrMsg

            if (err.error.username) {
              const filterError = err.error.username.find((item: any) => {
                if (item.includes("valid")) {
                  invalidUsernameErrorMsg =
                    "กรุณาใส่ username ที่ประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข และเครื่องหมาย @ . + - _ เท่านั้น"
                }
                if (item.includes("exists")) {
                  usernameExists = "ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว"
                }
              })
            }

            if (err.error.password1) {
              const filterError = err.error.password1.find((item: any) => {
                if (item.includes("numeric")) {
                  numericPasswordErrMsg = "รหัสผ่านห้ามเป็นตัวเลขอย่างเดียว"
                }
                if (item.includes("common")) {
                  commonPasswordErrMsg =
                    "รหัสผ่านนี้ธรรมดาเกินไป ควรจะประกอบด้วยตัวอักษร ตัวเลข และเครื่องหมายผสมกัน"
                }
                if (item.includes("short")) {
                  tooShortPasswordErrMsg =
                    "รหัสผ่านสั้นเกินไป ต้องมีอย่างน้อย 8 ตัวอักษร"
                }
              })
            }
            this.isMsgBoxDisplay = true
            this.isRegisterSuccess = false
            this.registerMsg = `<p>สมัครสมาชิกไม่สำเร็จ</p> 
            ${
              err.error.username
                ? invalidUsernameErrorMsg
                  ? `<p class='mb-0'>- ${invalidUsernameErrorMsg}</p>`
                  : ""
                : ""
            }
            ${
              err.error.username
                ? usernameExists
                  ? `<p class='mb-0'>- ${usernameExists}</p>`
                  : ""
                : ""
            }
            ${
              err.error.email
                ? "<p class='mb-0'>- อีเมลนี้ถูกใช้ไปแล้ว</p>"
                : ""
            }
             ${
               err.error.non_field_errors
                 ? "<p class='mb-0'>- รหัสผ่านคล้ายกับชื่อผู้ใช้มากเกินไป</p>"
                 : ""
             }
             ${
               err.error.password1
                 ? numericPasswordErrMsg
                   ? `<p class='mb-0'>- ${numericPasswordErrMsg}</p>`
                   : ""
                 : ""
             }
              ${
                err.error.password1
                  ? commonPasswordErrMsg
                    ? `<p class='mb-0'>- ${commonPasswordErrMsg}</p>`
                    : ""
                  : ""
              }
                ${
                  err.error.password1
                    ? tooShortPasswordErrMsg
                      ? `<p class='mb-0'>- ${tooShortPasswordErrMsg}</p>`
                      : ""
                    : ""
                }                         
            `
          }
        )
    } else {
      this.isMsgBoxDisplay = true
      this.isRegisterSuccess = false
      this.registerMsg = "สมัครสมาชิกไม่สำเร็จ"
    }

    this.registerForm.markAllAsTouched()
  }

  get f() {
    return this.registerForm
  }

  get username() {
    return this.registerForm.get("username")
  }
  get email() {
    return this.registerForm.get("email")
  }
  get password1() {
    return this.registerForm.get("password1")
  }
  get password2() {
    return this.registerForm.get("password2")
  }

  mustMatch: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const pass1 = control.get("password1")
    const pass2 = control.get("password2")

    if (pass2.errors && !pass2.errors.MustMatch) {
      return null
    }

    if (pass1.value !== pass2.value) {
      pass2.setErrors({ MustMatch: true })
    } else {
      pass2.setErrors(null)
    }
  }
}
