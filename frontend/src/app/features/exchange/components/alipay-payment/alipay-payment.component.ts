import { Component, OnInit } from "@angular/core"
import { Account } from "src/app/shared/models/payment-gateway.model"
import {
  ExchangeMoneyActiveStage,
  PaymentMethod,
} from "src/app/shared/models/exchange-money.model"
import { StorageService } from "../../services/storage.service"
import { PaymentGatewayService } from "src/app/shared/services/payment-gateway.service"
import { TRANSLOCO_SCOPE } from "@ngneat/transloco"

@Component({
  selector: "alipay-payment",
  templateUrl: "./alipay-payment.component.html",
  styleUrls: ["./alipay-payment.component.scss"],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: "exchange" }],
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
