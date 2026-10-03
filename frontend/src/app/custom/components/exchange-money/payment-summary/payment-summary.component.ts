import { Component, OnInit } from "@angular/core"
import {
  Account,
  ExchangeMoneyActiveStage,
  PaymentCurrency,
  PaymentDetails,
  PaymentMethod,
} from "../../../interfaces"
import {
  CurrencyService,
  PaymentGatewayService,
  StorageService,
} from "../../../services"

@Component({
  selector: "payment-summary",
  templateUrl: "./payment-summary.component.html",
  styleUrls: ["./payment-summary.component.scss"],
})
export class PaymentSummaryComponent implements OnInit {
  form: string = "input"
  paymentMethod: PaymentMethod

  constructor(
    private storageService: StorageService,
    private paymentGatewayService: PaymentGatewayService,
    private currencyService: CurrencyService
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
      return "ชำระเงินผ่านการฝากจ่ายโดย Alipay ของบริษัท"
    }
    return "ชำระเงินผ่านบัญชีธนาคาร"
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
          alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง")
          this.storageService.setExchangeMoneyState({
            activeStage: ExchangeMoneyActiveStage.All,
            paymentMethod: PaymentMethod.Bank,
          })
        }
      )
    this.storageService.resetPaymentDetails()
  }
}
