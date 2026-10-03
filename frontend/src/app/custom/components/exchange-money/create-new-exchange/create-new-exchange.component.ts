import { Component, OnInit } from "@angular/core"
import { StorageService } from "../../../services"
import { ExchangeMoneyActiveStage, PaymentMethod } from "../../../interfaces"

@Component({
  selector: "create-new-exchange",
  templateUrl: "./create-new-exchange.component.html",
  styleUrls: ["./create-new-exchange.component.scss"],
})
export class CreateNewExchangeComponent implements OnInit {
  paymentMethod: PaymentMethod

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    this.storageService.getExchangeMoneyState().subscribe((value) => {
      this.paymentMethod = value.paymentMethod
    })
    this.storageService.setPaymentDetails({ payment_gateway_type: this.paymentMethod })
  }

  onSelectPaymenyMethod(method) {
    this.storageService.setExchangeMoneyState({
      activeStage: ExchangeMoneyActiveStage.New,
      paymentMethod: method,
    })
    this.storageService.resetPaymentDetails()
    this.storageService.setPaymentDetails({ payment_gateway_type: method })
  }
}
