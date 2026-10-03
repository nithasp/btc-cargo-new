import { Component, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import {
  ExchangeMoneyActiveStage,
  PaymentCurrency,
  VerificationStates,
} from "../../../interfaces"
import {
  ApiService,
  CurrencyService,
  ExchangeService,
  StorageService,
} from "../../../services"

@Component({
  selector: "app-create-exchange",
  templateUrl: "./create-exchange.component.html",
  styleUrls: ["./create-exchange.component.scss"],
})
export class CreateExchangeComponent implements OnInit {
  annoucementKey: string = "payment_announcement"
  serviceConditionKey: string = "payment_service_conditions"
  annoucementHtml: string
  serviceConditionHtml: string

  currentState: ExchangeMoneyActiveStage
  uploadedFile: File
  isLoading: boolean = false

  verificationState: VerificationStates
  imageUrl: string = ""

  currency: PaymentCurrency

  constructor(
    private apiService: ApiService,
    private exchangeService: ExchangeService,
    private storageService: StorageService,
    private currencyService: CurrencyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true
    this.apiService.getHtmlContent(this.annoucementKey).subscribe(
      (response) => {
        this.annoucementHtml = response.data.html
      },
      (error) => {
        console.log("error ", error)
      }
    )
    this.apiService.getHtmlContent(this.serviceConditionKey).subscribe(
      (response) => {
        this.serviceConditionHtml = response.data.html
      },
      (error) => {
        console.log("error ", error)
      }
    )
    this.exchangeService.getExchangeState().subscribe(
      (response) => {
        this.verificationState = response.data.verification_state
        this.isLoading = false
      },
      (error) => {
        console.log("error ", error)
        alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง")
        this.router.navigate(["/web/warehouse-address"])
        this.isLoading = false
      }
    )
    this.storageService.getExchangeMoneyState().subscribe((value) => {
      this.currentState = value.activeStage
    })
    this.currencyService.getCurrency({ service: "payment" }).subscribe(
      (response) => {
        this.currency = response.data.find((item) => item.payment).payment
      },
      (error) => {}
    )
  }

  getExchangeRate() {
    return this.currency && this.currency.rate
  }

  handleFileInput(files: FileList) {
    this.uploadedFile = files.item(0)
  }

  uploadValidationFile() {
    let body = new FormData()
    body.append("file", this.uploadedFile, this.uploadedFile.name)
    body.append("type", "beach")

    this.exchangeService.uploadImageVerification(body).subscribe(
      (response: any) => {
        this.imageUrl = response.data.url
        this.createVerification()
      },
      (error) => {
        console.log("error ", error)
        alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง")
      }
    )
    this.uploadedFile = undefined
  }

  createVerification() {
    const body = {
      upload_url: this.imageUrl,
    }

    this.exchangeService.createValidation(body).subscribe(
      (response) => {
        this.verificationState = response.data[0].state
      },
      (error) => {
        console.log("error ", error)
        alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง")
      }
    )
  }
}
