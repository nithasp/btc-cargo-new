import { Component, OnInit } from "@angular/core"
import { StorageService } from "../../services/storage.service"
import {
  ExchangeMoneyActiveStage,
  PaymentMethod,
} from "src/app/shared/models/exchange-money.model"
import { TRANSLOCO_SCOPE } from "@ngneat/transloco"

@Component({
  selector: "create-new-exchange",
  templateUrl: "./create-new-exchange.component.html",
  styleUrls: ["./create-new-exchange.component.scss"],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: "exchange" }],
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
