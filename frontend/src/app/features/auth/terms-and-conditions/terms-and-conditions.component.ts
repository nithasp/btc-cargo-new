import { Component, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { HtmlContent } from "../../../interfaces"
import { ApiService, AuthService, UserService } from "../../../services"
import { TranslocoService } from "@ngneat/transloco"

@Component({
  selector: "app-terms-and-conditions",
  templateUrl: "./terms-and-conditions.component.html",
  styleUrls: ["./terms-and-conditions.component.scss"],
})
export class TermsAndConditionsComponent implements OnInit {
  termsAndConditionsKey: string = "terms_and_conditions"
  isAcceptedTermsAndConditons: boolean

  isFromRegister: boolean

  consent: HtmlContent

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private apiService: ApiService,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    this.apiService.getHtmlContent(this.termsAndConditionsKey).subscribe(
      (response) => {
        this.consent = response.data
      },
      (error) => {
        console.log("error ", error)
      }
    )
  }

  handleBack() {
    this.router.navigate(["/pdpa-conditions"])
  }

  handleNext() {
    const body = {
      extendeduser: {
        has_consent: true,
      },
    }
    this.userService.updateUser(body).subscribe(
      (response) => {
        this.router.navigate(["/web"])
      },
      (error) => {
        console.log("error ", error)
        alert(this.transloco.translate("error_occurred_try_again"))
      }
    )
  }
}
