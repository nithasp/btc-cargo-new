import { Component, OnInit } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { ApiResponse, Details, Quotation } from "src/app/custom/interfaces"
import { TrackingService } from "src/app/custom/services"

@Component({
  selector: "app-transport-payment-detail",
  templateUrl: "./transport-payment-detail.component.html",
  styleUrls: ["./transport-payment-detail.component.scss"],
})
export class TransportPaymentDetailComponent implements OnInit {
  transportPaymentNumber: number
  items

  constructor(
    private activatedRoute: ActivatedRoute,
    private trackingService: TrackingService
  ) {}

  ngOnInit(): void {
    this.getQuotationDetail()
  }

  getQuotationDetail() {
    const transportPaymentNumberParam =
      this.activatedRoute.snapshot.params["transport-payment-number"]
    this.transportPaymentNumber = Number(transportPaymentNumberParam)

    const body = {
      page: 1,
      pageSize: 10,
    }
    this.trackingService.getSaleChinaTrackingDetail(body).subscribe(
      (response: ApiResponse<Details>) => {
        const matchData = response.data.records.find(
          (x) => x.lot.id === this.transportPaymentNumber
        );
        const matchData2 = { ...matchData, is_checked: false };
        this.items = matchData2;
      },
      (error) => {
        console.log("error ", error)
      }
    )
  }

  checkAllBox(elem): void {
    if (elem.checked) {
      this.items.lot.child_ids.map((item: Quotation) => {
        item.is_checked = true
      })
    } else {
      this.items.lot.child_ids.map((item: Quotation) => {
        item.is_checked = false
      })
    }
  }

  getWeight(value) {
    if (value) {
      return value.reduce((acc, item) => {
        return (acc += item.weight)
      }, 0)
    }
    return "-"
  }
  getWidth(value) {
    if (value) {
      return value.reduce((acc, item) => {
        return (acc += item.width)
      }, 0)
    }
    return "-"
  }
  getHeight(value) {
    if (value) {
      return value.reduce((acc, item) => {
        return (acc += item.height)
      }, 0)
    }
    return "-"
  }
  getDepth(value) {
    if (value) {
      return value.reduce((acc, item) => {
        return (acc += item.depth)
      }, 0)
    }
    return "-"
  }

  renderText(value) {
    if (value) {
      return value
    }
    return "-"
  }
}
