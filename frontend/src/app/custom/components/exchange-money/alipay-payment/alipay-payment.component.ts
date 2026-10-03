import { Component, OnInit } from "@angular/core"
import { Account, ExchangeMoneyActiveStage, PaymentMethod } from "../../../interfaces"
import { StorageService, PaymentGatewayService } from "../../../services"

@Component({
  selector: "alipay-payment",
  templateUrl: "./alipay-payment.component.html",
  styleUrls: ["./alipay-payment.component.scss"],
})
export class AlipayPaymentComponent implements OnInit {
  selectedAccountId = 1
  accounts: Account[]

  constructor(private storageService: StorageService, private paymentGatewayService: PaymentGatewayService) {}
  formState: string = "selectAccount"

  ngOnInit(): void {
    this.paymentGatewayService.getAlipayAccounts().subscribe(
      (response) => {
        this.accounts = response.data
      },
      (error) => {
        console.log("error ", error)
      }
    )
  }

  onCancel() {
    this.storageService.setExchangeMoneyState({
      activeStage: ExchangeMoneyActiveStage.All,
      paymentMethod: PaymentMethod.Bank,
    })
  }

  getLabel(item) {
    return `${item.name} (${item.note})`
  }

  handleNextFormState() {
    switch (this.formState) {
      case "selectAccount":
        this.storageService.setPaymentDetails({
          alipay_account_id: this.selectedAccountId,
        })
        return (this.formState = "paymentDetails")
      case "paymentDetails":
        this.storageService.setExchangeMoneyState({
          activeStage: ExchangeMoneyActiveStage.Summary,
          paymentMethod: PaymentMethod.Alipay,
        })
        return (this.formState = "selectAccount")
      default:
        return (this.formState = "selectAccount")
    }
  }
}
