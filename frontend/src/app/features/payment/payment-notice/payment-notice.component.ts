import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { take } from "rxjs/operators"
import {
  PaymentGatewayRecords,
  PaymentAccount,
} from "src/app/shared/models/payment-gateway.model"
import { btcBaseUrl } from "src/app/core/config/api-config"
import { ExchangeService } from "src/app/shared/services/exchange.service"
import { PaymentGatewayService } from "src/app/shared/services/payment-gateway.service"
import { PaymentService } from "../services/payment.service"
import { TRANSLOCO_SCOPE, TranslocoService } from "@ngneat/transloco"

@Component({
  selector: "app-payment-notice",
  templateUrl: "./payment-notice.component.html",
  styleUrls: ["./payment-notice.component.scss"],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: "payment" }],
})
export class PaymentNoticeComponent implements OnInit {
  isMeridian: boolean
  files: File[] = []

  bill: PaymentGatewayRecords
  amountPay: number = 1
  paymentDate: any = new Date()
  paymentTime: any = new Date()

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private paymentService: PaymentService,
    private paymentGatewayService: PaymentGatewayService,
    private exchangeService: ExchangeService,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    this.getBill()
  }

  billSubmit() {
    const getDateValue = Date.parse(this.paymentDate)
    const tzoffsetDate = new Date().getTimezoneOffset()
    const dateValue = new Date(getDateValue - tzoffsetDate)
      .toISOString()
      .split("T")[0]
    const getTimeValue = Date.parse(this.paymentTime)
    const tzoffsetTime = new Date().getTimezoneOffset()
    const timeValue = new Date(getTimeValue - tzoffsetTime)
      .toISOString()
      .split("T")[1]
      .split(".")[0]
    const dateTimeValue = `${dateValue} ${timeValue}`

    const bodyParams1 = {
      payment_gateway_id: this.bill.id,
      amount: this.amountPay,
      payment_date_time: dateTimeValue,
      image_ids: this.files[0],
    }

    if (this.files.length > 0) {
      let body = new FormData()
      body.append("file", this.files[0], this.files[0].name)
      body.append("type", "payment")
      this.exchangeService.uploadImageVerification(body).subscribe(
        (res: any) => {
          const imageUrl = `${btcBaseUrl}${res.data.url}`
          const bodyParams2 = {
            ...bodyParams1,
            image_ids: [
              {
                url: imageUrl,
                status: 1,
              },
            ],
          }
          this.paymentService.createPayment(bodyParams2).subscribe(
            (res) => {
              alert(this.transloco.translate("notify_success", {}, "payment"))
              setTimeout(() => {
                this.router.navigate(["/web/bills"])
              }, 2000)
            },
            (err) => {
              alert(this.transloco.translate("error_occurred_try_again"))
              console.log(err)
            }
          )
        },
        (error) => {
          console.log("error ", error)
        }
      )
    } else {
      this.paymentService.createPayment(bodyParams1).subscribe(
        (res) => {
          alert(this.transloco.translate("notify_success", {}, "payment"))
          setTimeout(() => {
            this.router.navigate(["/web/bills"])
          }, 2000)
        },
        (err) => {
          alert(this.transloco.translate("error_occurred_try_again"))
          console.log(err)
        }
      )
    }
  }

  getBill() {
    const billParam = Number(this.activatedRoute.snapshot.params["bill-id"])
    this.paymentGatewayService.getPaymentGatewayDetail(billParam).subscribe(
      (res) => {
        if (res.data) {
          this.bill = res.data
        } else {
          this.transloco
            .selectTranslate("bill_not_found", {}, "payment")
            .pipe(take(1))
            .subscribe((message) => {
              alert(message)
              this.router.navigate(["/web/bills"])
            })
        }
      },
      (err) => {
        console.log(err)
      }
    )
  }

  checkValue(): void {
    if (this.amountPay && this.amountPay < 1) {
      this.amountPay = 1
    }
  }

  onSelectFile(event: any) {
    this.files = [event.addedFiles[0]]
  }

  onRemoveFile(event: any) {
    this.files.splice(this.files.indexOf(event), 1)
  }

  handleAmountPay(event) {
    return event.keyCode !== 69
  }

  getPaymentAccount(serviceType: string): PaymentAccount {
    const paymentAccountConfig: {[serviceType: string]: PaymentAccount} = {
      "delivery": {
        bankName: "payment.bank_kasikorn",
        branchName: "payment.branch_the_mall_ngamwongwan",
        accountName: "บจก. บีทีซี คาร์โก้ แอนด์ เซอร์วิซ",
        accountTypeName: "payment.account_type_current",
        accountNumber: "050-2-93840-1",
      },
      "default": {
        bankName: "payment.bank_scb",
        branchName: null,
        accountName: "บัญชี บริษัท เก็ท ต้า หยวน จำกัด",
        accountTypeName: null,
        accountNumber: "381-3-00728-1",
      }
    };

    if (paymentAccountConfig.hasOwnProperty(serviceType)) {
      return paymentAccountConfig[serviceType];
    }
    return paymentAccountConfig['default'];
  }
}
