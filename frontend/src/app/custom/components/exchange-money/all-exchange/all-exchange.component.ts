import { Component, OnInit } from "@angular/core"
import * as moment from "moment"
import {
  ExchangeMoneyActiveStage,
  Pagination,
  PaymentMethod,
} from "../../../interfaces"
import {
  CurrencyService,
  PaymentGatewayService,
  StorageService,
} from "../../../services"

@Component({
  selector: "all-exchange",
  templateUrl: "./all-exchange.component.html",
  styleUrls: ["./all-exchange.component.scss"],
})
export class AllExchangeComponent implements OnInit {
  isServiceAvailable: boolean

  data: any
  pagination: Pagination
  pageNumbers: number[]

  constructor(
    private storageService: StorageService,
    private currencyService: CurrencyService,
    private paymentGatewayService: PaymentGatewayService
  ) {}

  ngOnInit(): void {
    this.getData()
    this.verifyServiceStatus()
  }

  createNewExchange() {
    this.storageService.setExchangeMoneyState({
      activeStage: ExchangeMoneyActiveStage.New,
      paymentMethod: PaymentMethod.Bank,
    })
  }

  verifyServiceStatus() {
    this.currencyService
      .getCurrencyServiceStatus({ service: "payment" })
      .subscribe(
        (response) => {
          this.isServiceAvailable = response.data.status ? true : false
        },
        (error) => {
          console.log("error ", error)
          this.isServiceAvailable = false
        }
      )
  }

  isEmptyDetails(): boolean {
    return this.data?.length === 0
  }

  getData() {
    const body = { page: 1, pageSize: 10, service: "payment" }
    this.paymentGatewayService.getPaymentGateway(body).subscribe(
      (response) => {
        this.data = response.data.records
        const { pagination } = response.data
        this.pagination = pagination
        this.pageNumbers = Array.from(
          { length: pagination.endPage < 5 ? pagination.endPage : 5 },
          (_, index) => index + 1
        )
      },
      (error) => {
        console.log("error ", error)
      }
    )
  }

  getDateTimeText(date) {
    const dateTime = new Date(date)
    return moment(dateTime).format("DD-MM-YYYY - HH:mm")
  }

  handleChangePage(pageNumber) {
    const body = {
      page: pageNumber,
      pageSize: 10,
      service: "payment",
    }
    this.paymentGatewayService.getPaymentGateway(body).subscribe(
      (response) => {
        this.data = response.data.records
        const { pagination } = response.data
        this.pagination = pagination
        this.pageNumbers = Array.from(
          { length: pagination.endPage < 5 ? pagination.endPage : 5 },
          (_, index) => index + 1
        )
      },
      (error) => {
        console.log("error ", error)
      }
    )
  }
}
