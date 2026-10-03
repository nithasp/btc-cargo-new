import { Component, OnInit } from "@angular/core"
import {
  AmountSplit,
  ExchangeMoneyActiveStage,
  PaymentMethod,
  Wallet,
} from "../../../interfaces"
import { StorageService, WalletService } from "../../../services"

@Component({
  selector: "payment-details",
  templateUrl: "./payment-details.component.html",
  styleUrls: ["./payment-details.component.scss"],
})
export class PaymentDetailsComponent implements OnInit {
  form: string = "input"
  paymentMethod: PaymentMethod
  uploadedFile: File

  amount: number = 0
  inputList: AmountSplit[]
  remark: string

  wallets: Wallet[] = []

  constructor(
    private storageService: StorageService,
    private walletService: WalletService
  ) {}

  ngOnInit(): void {
    this.storageService.getExchangeMoneyState().subscribe((value) => {
      this.paymentMethod = value.paymentMethod
    })
    this.walletService.getWallets({ active: true }).subscribe(
      (response) => {
        this.wallets = response.data
        this.inputList = [
          {
            credit_amount: 0,
            use_credit_amount: 0,
            wallet_id: response.data[0].id,
          },
        ]
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

  addItem() {
    this.inputList.push({
      credit_amount: 0,
      use_credit_amount: 0,
      wallet_id: this.wallets[0].id,
    })
  }

  removeItem(index: number) {
    this.inputList.splice(index, 1)
  }

  getAmountLabel(index: number) {
    if (this.paymentMethod === PaymentMethod.Alipay) {
      return `ยอดที่ ${index + 1}`
    } else {
      return "ยอดเงินรวม"
    }
  }

  getWalletDisplayName(id) {
    return this.wallets.find((item) => item.id === id).display_name
  }

  getTotalWalletsBalance() {
    let totalAmount = 0
    this.wallets.map(
      (item) => (totalAmount = totalAmount + Number(item.credit_amount))
    )
    return totalAmount
  }

  handleNextFormState() {
    const paymentDetails = {
      amount_split: this.inputList,
      description: this.remark,
    }
    if (this.paymentMethod === PaymentMethod.Alipay) {
      this.storageService.setPaymentDetails(paymentDetails)
    } else {
      this.storageService.setPaymentDetails({
        amount: this.amount,
      })
    }
    this.storageService.setExchangeMoneyState({
      activeStage: ExchangeMoneyActiveStage.Summary,
      paymentMethod: this.paymentMethod,
    })
  }

  verifyDisbledConfirmButton() {
    if (this.paymentMethod === PaymentMethod.Bank) {
      return !this.amount
    } else {
      if (this.inputList) {
        // Check 0 amount
        if (this.inputList.find((item) => item.credit_amount === 0)) {
          return true
        }

        // Check credit return amount used exceeds credit amount in wallet
        let result = this.inputList.map((item) => {
          let wallet = this.wallets.find((w) => w.id === item.wallet_id)
          let items = this.inputList.filter(
            (item) => item.wallet_id === wallet.id
          )
          let totalAmountUsedInWallet = 0
          items.map(
            (i) =>
              (totalAmountUsedInWallet =
                totalAmountUsedInWallet + Number(i.use_credit_amount))
          )
          if (wallet.credit_amount < totalAmountUsedInWallet) {
            return true
          }
        })
        if (result.includes(true)) {
          return true
        }
        
        // Check input amount exceeds credit amount in wallet
        let totalReturnCredit = 0
        this.inputList &&
          this.inputList.map(
            (item) =>
              (totalReturnCredit =
                totalReturnCredit + Number(item.use_credit_amount))
          )
        if (this.getTotalWalletsBalance() < totalReturnCredit) {
          return true
        }
      }
    }
    return false
  }
}
