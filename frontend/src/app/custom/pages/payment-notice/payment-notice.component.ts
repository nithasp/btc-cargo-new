import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { PaymentGatewayRecords, PaymentAccount } from "../../interfaces"
import {
  btcBaseUrl,
  ExchangeService,
  PaymentGatewayService,
  PaymentService,
} from "../../services"

@Component({
  selector: "app-payment-notice",
  templateUrl: "./payment-notice.component.html",
  styleUrls: ["./payment-notice.component.scss"],
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
    private exchangeService: ExchangeService
  ) {}

  ngOnInit(): void {
    this.getBill()
  }

  billSubmit() {
    // Convert Date to ISO Format
    const getDateValue = Date.parse(this.paymentDate)
    const tzoffsetDate = new Date().getTimezoneOffset()
    const dateValue = new Date(getDateValue - tzoffsetDate)
      .toISOString()
      .split("T")[0]
    // Convert Time
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
              alert("แจ้งการชำระเงินสำเร็จ เรากำลังจะพาท่านกลับไปที่หน้าบิล")
              setTimeout(() => {
                this.router.navigate(["/web/bills"])
              }, 2000)
            },
            (err) => {
              alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง")
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
          alert("แจ้งการชำระเงินสำเร็จ เรากำลังจะพาท่านกลับไปที่หน้าบิล")
          setTimeout(() => {
            this.router.navigate(["/web/bills"])
          }, 2000)
        },
        (err) => {
          alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง")
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
          alert("ไม่พบเลขที่บิลนี้")
          this.router.navigate(["/web/bills"])
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
        bankName: "กสิกรไทย",
        branchName: "เดอะมอลล์ งามวงศ์วาน",
        accountName: "บจก. บีทีซี คาร์โก้ แอนด์ เซอร์วิซ",
        accountTypeName: "กระแสรายวัน",
        accountNumber: "050-2-93840-1",
      },
      "default": {
        bankName: "ไทยพาณิชย์",
        branchName: "-",
        accountName: "บัญชี บริษัท เก็ท ต้า หยวน จำกัด",
        accountTypeName: "-",
        accountNumber: "381-3-00728-1",
      }
    };

    if (paymentAccountConfig.hasOwnProperty(serviceType)) {
      return paymentAccountConfig[serviceType];
    }
    return paymentAccountConfig['default'];
  }
}
