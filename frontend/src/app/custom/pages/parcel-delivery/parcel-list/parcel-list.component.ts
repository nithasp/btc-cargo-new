import { Component, OnInit } from "@angular/core"
import { MasterDataService, TrackingService } from "../../../services"
import { ApiResponse, Details, Detail, Pagination } from "../../../interfaces"
import { TRANSLOCO_SCOPE } from "@ngneat/transloco"
@Component({
  selector: "parcel-list",
  templateUrl: "./parcel-list.component.html",
  styleUrls: ["./parcel-list.component.scss"],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: "parcel" }],
})
export class ParcelListComponent implements OnInit {
  status = "status_in_china_warehouse"
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

  getLocationKey(input) {
    if (this.locations) {
      const location = this.locations.find((item) => item.id === input?.id)
      switch (location?.display_name) {
        case "CN-WH/Stock":
          return "status_in_china_warehouse"
        case "TH-WH/Stock":
          return "status_arrived_thailand"
        case "Transit":
          return "status_departed_china"
        default:
          return null
      }
    }
    return null
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
