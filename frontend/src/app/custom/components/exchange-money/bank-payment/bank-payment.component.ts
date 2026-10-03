import { Component, OnInit } from "@angular/core"
import {
  ExchangeMoneyActiveStage,
  PaymentMethod,
  FormState,
  AccountType,
} from "../../../interfaces"
import { ExchangeService, StorageService } from "../../../services"

@Component({
  selector: "bank-payment",
  templateUrl: "./bank-payment.component.html",
  styleUrls: ["./bank-payment.component.scss"],
})
export class BankPaymentComponent implements OnInit {
  form: string = "input"
  formState: FormState = FormState.SelectAccount

  accountName: string
  accountNumber: string

  uploadedFile: File

  constructor(
    private storageService: StorageService,
    private exchangeService: ExchangeService
  ) {}

  ngOnInit(): void {}

  isDisabledNextButton() {
    if(this.form === "input") {
      return !this.accountName || !this.accountNumber
    }
    else {
      return !this.uploadedFile
    }
  }
  onCancel() {
    this.storageService.setExchangeMoneyState({
      activeStage: ExchangeMoneyActiveStage.All,
      paymentMethod: PaymentMethod.Bank,
    })
  }

  handleChangeFormState(state) {
    if(state === "input") {
      this.uploadedFile = undefined
      
    } else {
      this.accountName = undefined
      this.accountNumber = undefined
    }
    this.form = state
  }

  handleFileInput(files: FileList) {
    this.uploadedFile = files.item(0)
  }

  handleNextFormState() {
    switch (this.formState) {
      case FormState.SelectAccount:
        if (this.form === "input") {
          this.storageService.setPaymentDetails({
            account_name: this.accountName,
            account_number: this.accountNumber,
            account_type: AccountType.Detail
          })
        } else {
          let body = new FormData()
          body.append("file", this.uploadedFile, this.uploadedFile.name)
          body.append("type", "beach")
          this.exchangeService.uploadImageVerification(body).subscribe(
            (response) => {
              this.storageService.setPaymentDetails({
                account_url: response.data.url,
                account_type: AccountType.Image
              })
            },
            (error) => {
              console.log("error ", error)
              alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง")
              this.uploadedFile = undefined
              return
            }
          )
        }
        return (this.formState = FormState.PaymentDetails)
      case FormState.PaymentDetails:
        this.storageService.setExchangeMoneyState({
          activeStage: ExchangeMoneyActiveStage.Summary,
          paymentMethod: PaymentMethod.Bank,
        })
        return (this.formState = FormState.SelectAccount)
      default:
        return (this.formState = FormState.SelectAccount)
    }
  }
}
