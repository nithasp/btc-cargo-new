import { Component, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { HtmlContent } from "src/app/shared/models/common.model"
import { ApiService } from "src/app/shared/services/api.service"
import { AuthService } from "src/app/shared/services/auth.service"
import { UserService } from "src/app/shared/services/user.service"

@Component({
  selector: "app-pdpa-conditions",
  templateUrl: "./pdpa-conditions.component.html",
  styleUrls: ["./pdpa-conditions.component.scss"],
})
export class PdpaConditionsComponent implements OnInit {
  isAcceptedDataManagement: boolean

  isFromRegister: boolean

  consent: HtmlContent

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.apiService.getConsent().subscribe(
      (response) => {
        this.consent = response.data
      },
      (error) => {
        console.log("error ", error)
      }
    )
  }

  handleBack() {
    this.authService.signOut()
  }

  handleNext() {
    this.router.navigate(["/terms-and-conditions"])
  }
}
