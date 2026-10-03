import { Component, OnInit } from "@angular/core";
import { Pagination, SaleSummaryRecords } from "../../../interfaces";
import { SaleSummaryService } from "src/app/custom/services";

@Component({
  selector: "app-manage-parcel",
  templateUrl: "./manage-parcel.component.html",
  styleUrls: ["./manage-parcel.component.scss"],
})
export class ManageParcelComponent implements OnInit {
  bsValue: Date = new Date();
  saleSummaryItems: SaleSummaryRecords[] = [];

  pagination: Pagination;
  pageNumbers: number[];

  isMainContentDisplay: boolean = false;

  constructor(private saleSummaryService: SaleSummaryService) {}

  ngOnInit(): void {
    this.getSaleSummary();
  }

  setMainContentDisplay(value) {
    if (value.verificationState === true) {
      this.isMainContentDisplay = value.verificationState;
    }
  }

  getSaleSummary() {
    const body = {
      page: 1,
      pageSize: 10,
    };
    this.saleSummaryService.getSaleSummary(body).subscribe(
      (res) => {
        this.saleSummaryItems = res.data.records;
        const { pagination } = res.data;
        this.pagination = pagination;
        this.pageNumbers = Array.from(
          { length: pagination.endPage },
          (_, index) => {
            return index + 1;
          }
        );
      },
      (err) => console.log(err)
    );
  }

  editDiscount(item, discountValue) {
    const discountValueNumber = Number(discountValue.value);
    const body = {
      sale_order_id: item.id,
      discount_amount: discountValueNumber,
    };
    if (discountValueNumber > item.affiliate_commission) {
      alert(
        `ส่วนลดต้องไม่มากกว่าค่า Affiliate Commission ปัจจุบันคือ ${item.affiliate_commission} บาท`
      );
    } else {
      this.saleSummaryService.editDiscount(body).subscribe(
        (res) => {
          this.getSaleSummary();
        },
        (err) => {
          console.log(err);
          alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง");
        }
      );
    }
  }

  handleChangePage(pageNumber) {
    if (pageNumber !== this.pagination.page) {
      const body = {
        page: pageNumber,
        pageSize: 10,
      };
      this.saleSummaryService.getSaleSummary(body).subscribe(
        (res) => {
          this.saleSummaryItems = res.data.records;
          this.pagination = res.data.pagination;
        },
        (err) => console.log(err)
      );
    }
  }

  handleAmountPay(event) {
    return event.keyCode !== 69;
  }
}
