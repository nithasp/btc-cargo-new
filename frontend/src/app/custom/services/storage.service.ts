import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import {
  ExchangeMoneyStore,
  ExchangeMoneyActiveStage,
  PaymentDetails,
  PaymentMethod,
} from "../interfaces"

@Injectable({
  providedIn: "root",
})
export class StorageService {
  public parcelList = []
  public paymentDetails: PaymentDetails
  public exchangeMoneyState = new BehaviorSubject<ExchangeMoneyStore>({
    activeStage: ExchangeMoneyActiveStage.All,
    paymentMethod: PaymentMethod.Bank,
  })

  constructor() {}

  getParcelList() {
    return this.parcelList
  }

  setParcelList(list) {
    this.parcelList = list
  }

  getPaymentDetails(): PaymentDetails {
    return this.paymentDetails
  }

  setPaymentDetails(details: Partial<PaymentDetails>) {
    this.paymentDetails = { ...this.paymentDetails, ...details }
  }

  resetPaymentDetails() {
    this.paymentDetails = undefined
  }

  getExchangeMoneyState(): Observable<ExchangeMoneyStore> {
    return this.exchangeMoneyState.asObservable()
  }

  setExchangeMoneyState(state: ExchangeMoneyStore) {
    this.exchangeMoneyState.next(state)
  }
}
