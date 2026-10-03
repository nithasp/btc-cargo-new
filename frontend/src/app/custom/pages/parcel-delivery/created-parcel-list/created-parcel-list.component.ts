import { Component, OnInit } from "@angular/core"
import {
  ApiResponse,
  ChinaTrackingDetails,
  DeliveryType,
} from "../../../interfaces"
import { MasterDataService, TrackingService } from "../../../services"

@Component({
  selector: "created-parcel-list",
  templateUrl: "./created-parcel-list.component.html",
  styleUrls: ["./created-parcel-list.component.scss"],
})
export class CreatedParcelListComponent implements OnInit {
  status = "เข้าโกดังจีน"
  bsValue = new Date()

  details: any
  pagination: any
  pageNumbers: number[]

  deliveryTypes: DeliveryType[]

  constructor(
    private trackingService: TrackingService,
    private masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.getDetails()
    this.getDeliveryTypes()
  }

  isEmptyDetails(): boolean {
    return this.details?.length === 0
  }
  
  getDetails(): void {
    const body = {
      page: 1,
      pageSize: 10,
    }
    this.trackingService.getCreatedTrackingList(body).subscribe(
      (response: ApiResponse<ChinaTrackingDetails>) => {
        this.details = response.data.records
        this.pagination = response.data.pagination
        this.pageNumbers = Array.from(
          { length: this.pagination.endPage < 5 ? this.pagination.endPage : 5 },
          (_, index) => index + 1
        )
      },
      (error) => {
        console.log("error ", error)
      }
    )
  }

  getDeliveryTypes() {
    this.masterDataService.getDeliveryType().subscribe(
      (response) => {
        this.deliveryTypes = response.data
      },
      (error) => {
        console.log(error)
      }
    )
  }

  getDeliveryTypeLabel(id: number) {
    if (this.deliveryTypes) {
      return this.deliveryTypes.find((item) => item.id === id).description
    }
  }

  getBoxLabel(type) {
    switch (type) {
      case "normal":
        return "ตีเฟรม"
      case "solid":
        return "ตีลังทึบ"
      default:
        return "ไม่ตีลังไม้"
    }
  }

  getPictureTypeLabel(bool) {
    if (bool) {
      return "ต้องการดูรูปถ่าย"
    } else {
      return "ไม่ต้องการดู"
    }
  }

  getQcTypeLabel(bool) {
    if (bool) {
      return "ต้องการ QC"
    } else {
      return "ไม่ต้องการ QC"
    }
  }

  renderText(value) {
    if (value) {
      return value
    }
    return "-"
  }

  handleChangePage(pageNumber) {
    const body = {
      page: pageNumber,
      pageSize: 10,
    }
    this.trackingService.getCreatedTrackingList(body).subscribe(
      (response) => {
        this.details = response.data.records
        this.pagination = response.data.pagination
        this.pageNumbers = Array.from(
          { length: response.data.pagination.endPage },
          (_, index) => index + 1
        )
        window.scrollTo(0, 0)
      },
      (error) => {
        console.log("error ", error)
      }
    )
  }
}
