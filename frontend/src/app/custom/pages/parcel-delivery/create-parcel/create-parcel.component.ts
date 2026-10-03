import { Component, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { MasterDataService, TrackingService } from "src/app/custom/services"

@Component({
  selector: "create-parcel",
  templateUrl: "./create-parcel.component.html",
  styleUrls: ["./create-parcel.component.scss"],
})
export class CreateParcelComponent implements OnInit {
  items = [
    {
      parcelNo: null,
      deliveryTypeId: 1,
      boxType: "ไม่ตี",
      qcType: "ไม่ต้องการ QC",
      pictureType: "ไม่ต้องการดูรูปถ่าย",
      note: null,
    },
  ]

  deliveryTypes: any

  isLoading: boolean = false

  constructor(
    private router: Router,
    private trackingService: TrackingService,
    private masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.getDeliveryTypes()
  }

  isDisabledSubmitButton(): boolean {
    if (this.items.length === 0) {
      return true
    }
    const isAllFilled = this.items.every((item) => item.parcelNo !== null)
    if (!isAllFilled) {
      return true
    }

    if(this.isLoading) {
      return true;
    }

    return false
  }

  addItem() {
    this.items.push({
      parcelNo: null,
      deliveryTypeId: 1,
      boxType: "ไม่ตี",
      qcType: "ไม่ต้องการ QC",
      pictureType: "ไม่ต้องการดูรูปถ่าย",
      note: null,
    })
  }

  removeItem(index: number) {
    this.items.splice(index, 1)
  }

  getDeliveryTypeName(id: number) {
    if (this.deliveryTypes) {
      return this.deliveryTypes.find((item) => item.id === id).description
    }
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

  getBoxType(type) {
    if (type === "ตีเฟรม") {
      return "normal"
    } else if (type === "ตีลังทึบ") {
      return "solid"
    }
    return "no"
  }

  onValidate() {
    this.isLoading = true
    const body = { serial_list: this.items.map((item) => item.parcelNo) }
    this.trackingService.validateSaleChinaTrackingDetail(body).subscribe(
      (response) => {
        if (!response.data.exist) {
          this.submitTrackingDetails()
        } else {
          alert("เลขพัสดุซ้ำ กรุณาใส่เลขพัสดุอื่น")
        }
      },
      (error) => {
        console.log("error ", error)
      }
    )
  }

  submitTrackingDetails() {
    const body = {
      china_tracking_ids: this.items.map((item) => {
        return {
          shopping_serial: item.parcelNo,
          delivery_type_id: item.deliveryTypeId,
          shipping_with_box: this.getBoxType(item.boxType),
          qc: item.qcType === "ไม่ต้องการ QC" ? false : true,
          required_picture:
            item.pictureType === "ไม่ต้องการดูรูปถ่าย" ? false : true,
          remark: item.note,
        }
      }),
    }
    this.trackingService.createSaleChinaTrackingDetail(body).subscribe(
      (response: any) => {
        this.items = undefined
        this.router.navigate(["/web/created-parcel-list"])
        this.isLoading = false
      },
      (error) => {
        this.isLoading = false
        console.log("error ", error)
      }
    )
  }

  onCancel() {
    this.items = undefined
    this.router.navigate(["/web/created-parcel-list"])
  }
}
