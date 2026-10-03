import { Component, OnInit } from "@angular/core";
import { Pagination, PaymentGatewayRecords } from "src/app/custom/interfaces";
import { PaymentGatewayService } from "src/app/custom/services";
import * as dayjs from "dayjs";

@Component({
  selector: "app-bills",
  templateUrl: "./bills.component.html",
  styleUrls: ["./bills.component.scss"],
})
export class BillsComponent implements OnInit {
  bills: PaymentGatewayRecords[] = [];
  pagination: Pagination;
  pageNumbers: number[];

  constructor(private paymentGatewayService: PaymentGatewayService) {}

  ngOnInit(): void {
    this.getBills();
  }

  getBills() {
    const body = {
      page: 1,
      pageSize: 10,
    };
    this.paymentGatewayService.getPaymentGateway(body).subscribe(
      (res) => {
        this.bills = res.data.records;
        this.pagination = res.data.pagination;
        this.pageNumbers = Array.from(
          { length: res.data.pagination.endPage },
          (_, index) => index + 1
        );
      },
      (err) => {
        console.log(err);
      }
    );
  }

  handleChangePage(pageNumber) {
    const body = {
      page: pageNumber,
      pageSize: 10,
    };
    this.paymentGatewayService.getPaymentGateway(body).subscribe(
      (res) => {
        this.bills = res.data.records;
        this.pagination = res.data.pagination;
        this.pageNumbers = Array.from(
          { length: res.data.pagination.endPage },
          (_, index) => index + 1
        );
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getNewFormatDate(value) {
    if (value) {
      const newFormatDate = dayjs(value)
        .add(7, "hour")
        .format("DD-MM-YYYY - HH:mm");
      return newFormatDate;
    }
    return "-";
  }
}
