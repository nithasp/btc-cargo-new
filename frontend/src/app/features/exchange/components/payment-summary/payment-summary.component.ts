import { Component, OnInit } from "@angular/core"
import { Account } from "src/app/shared/models/payment-gateway.model"
import {
  ExchangeMoneyActiveStage,
  PaymentCurrency,
  PaymentDetails,
  PaymentMethod,
} from "src/app/shared/models/exchange-money.model"
import { CurrencyService } from "../../services/currency.service"
import { PaymentGatewayService } from "src/app/shared/services/payment-gateway.service"
import { StorageService } from "../../services/storage.service"
import { TRANSLOCO_SCOPE, TranslocoService } from "@ngneat/transloco"

@Component({
  selector: "payment-summary",
  templateUrl: "./payment-summary.component.html",
  styleUrls: ["./payment-summary.component.scss"],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: "exchange" }],
})
export class PaymentSummaryComponent implements OnInit {
  form: string = "input"
  paymentMethod: PaymentMethod

  constructor(
    private storageService: StorageService,
    private paymentGatewayService: PaymentGatewayService,
    private currencyService: CurrencyService,
    private transloco: TranslocoService
  ) {}
  uploadedFile: File

  details: PaymentDetails
  accounts: Account[]
  currency: PaymentCurrency

  ngOnInit(): void {
    this.storageService.getExchangeMoneyState().subscribe((value) => {
      this.paymentMethod = value.paymentMethod
    })
    this.details = this.storageService.getPaymentDetails()
    this.paymentGatewayService.getAlipayAccounts().subscribe(
      (response) => {
        this.accounts = response.data
      },
      (error) => {
        console.log("error ", error)
      }
    )
    this.currencyService.getCurrency({ service: "payment" }).subscribe(
      (response) => {
        this.currency = response.data.find((item) => item.payment).payment
      },
      (error) => {}
    )
  }

  onCancel() {
    this.storageService.setExchangeMoneyState({
      activeStage: ExchangeMoneyActiveStage.All,
      paymentMethod: PaymentMethod.Bank,
    })
  }

  getPaymentMethodLabel() {
    if (this.paymentMethod === PaymentMethod.Alipay) {
      return "exchange.method_alipay"
    }
    return "exchange.method_bank"
  }

  getAlipayAccountName(id) {
    return this.accounts && this.accounts.find((item) => item.id === id).name
  }

  getSplitAmount() {
    let amountList = []
    this.details &&
      this.details.amount_split.map((item) =>
        amountList.push(item.credit_amount)
      )
    return amountList.join(", ")
  }

  getTotalAmount() {
    if (this.paymentMethod === PaymentMethod.Bank) {
      return this.details.amount
    } else {
      let total = 0
      this.details.amount_split.map((item) => {
        total = total + Number(item.credit_amount)
      })
      return total
    }
  }

  getUsedCreditTotalAmount() {
    if (this.paymentMethod === PaymentMethod.Bank) {
      return this.details.amount
    } else {
      let total = 0
      this.details.amount_split.map((item) => {
        total = total + Number(item.use_credit_amount)
      })
      return total
    }
  }

  getTotalWalletAmount() {
    let total = 0
    this.details.amount_split.map(
      (item) => (total = total + Number(item.use_credit_amount))
    )
    return total
  }

  getExchangeRate() {
    return this.currency && this.currency.rate
  }

  getConvertedExchangeAmount() {
    if (this.paymentMethod === PaymentMethod.Bank) {
      let amount = this.details.amount * this.getExchangeRate()
      return amount.toFixed(2)
    } else {
      let amount = this.getTotalAmount() * this.getExchangeRate()
      return amount.toFixed(2)
    }
  }

  getResult() {
    if (this.paymentMethod === PaymentMethod.Bank) {
      return this.getConvertedExchangeAmount()
    } else {
      const usedReturnBalance = Number(
        (this.getUsedCreditTotalAmount() * this.getExchangeRate()).toFixed(2)
      )
      const toPayAmount = Number(this.getConvertedExchangeAmount())
      return toPayAmount - usedReturnBalance
    }
  }

  onSubmit() {
    let body = {}
    if (this.paymentMethod === PaymentMethod.Alipay) {
      body = {
        ...this.details,
        amount_split: this.details.amount_split.map((item) => ({
          wallet_id: item.wallet_id,
          amount: Number(item.credit_amount),
          use_credit_amount: Number(item.use_credit_amount),
        })),
      }
    } else {
      body = {
        ...this.details,
        amount: Number(this.details.amount),
      }
    }
    this.paymentGatewayService
      .createPaymentGateway(body, { service: "payment" })
      .subscribe(
        (response) => {
          this.storageService.setExchangeMoneyState({
            activeStage: ExchangeMoneyActiveStage.All,
            paymentMethod: PaymentMethod.Bank,
          })
        },
        (error) => {
          console.log("error ", error)
          alert(this.transloco.translate("error_occurred_try_again"))
          this.storageService.setExchangeMoneyState({
            activeStage: ExchangeMoneyActiveStage.All,
            paymentMethod: PaymentMethod.Bank,
          })
        }
      )
    this.storageService.resetPaymentDetails()
  }
}
