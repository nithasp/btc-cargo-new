import { Component, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { HtmlContent } from "../../../interfaces"
import { ApiService, AuthService, UserService } from "../../../services"

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
