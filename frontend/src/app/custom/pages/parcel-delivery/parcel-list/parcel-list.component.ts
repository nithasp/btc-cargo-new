import { Component, OnInit } from "@angular/core"
import { MasterDataService, TrackingService } from "../../../services"
import { ApiResponse, Details, Detail, Pagination } from "../../../interfaces"
@Component({
  selector: "parcel-list",
  templateUrl: "./parcel-list.component.html",
  styleUrls: ["./parcel-list.component.scss"],
})
export class ParcelListComponent implements OnInit {
  status = "เข้าโกดังจีน"
  bsValue = new Date()

  details: Detail[]
  pagination: Pagination
  pageNumbers: number[]
  locations: any

  constructor(
    private trackingService: TrackingService,
    private masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.getDetails()
    this.getLocations()
  }

  isEmptyDetails(): boolean {
    return this.details?.length === 0
  }

  renderText(value) {
    if (value) {
      return value
    }
    return "-"
  }

  getPackingAndQcCost(pCost, qCost) {
    const packingCost = pCost ? pCost : 0
    const qcCost = qCost ? qCost : 0
    return packingCost + qcCost
  }

  getDetails(): void {
    const body = {
      page: 1,
      pageSize: 10,
    }
    this.trackingService.getSaleChinaTrackingDetail(body).subscribe(
      (response: ApiResponse<Details>) => {
        this.details = response.data.records
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

  getLocations(): void {
    this.masterDataService.getStockLocations().subscribe(
      (response: any) => {
        this.locations = response.data
      },
      (error) => {
        console.log("error ", error)
      }
    )
  }

  getLocationText(input) {
    if (this.locations) {
      const location = this.locations.find((item) => item.id === input?.id)
      switch (location?.display_name) {
        case "CN-WH/Stock":
          return "เข้าโกดังจีน"
        case "TH-WH/Stock":
          return "ถึงไทย"
        case "Transit":
          return "ออกจากจีน"
        default:
          return "-"
      }
    }
    return "-"
  }

  handleChangePage(pageNumber) {
    const body = {
      page: pageNumber,
      pageSize: 10,
    }
    this.trackingService.getSaleChinaTrackingDetail(body).subscribe(
      (response: ApiResponse<Details>) => {
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
