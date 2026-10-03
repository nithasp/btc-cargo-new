import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-bill-detail",
  templateUrl: "./bill-detail.component.html",
  styleUrls: ["./bill-detail.component.scss"],
})
export class BillDetailComponent implements OnInit {
  billNumber: number;

  constructor(private activateRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.getBillNumber();
  }

  getBillNumber() {
    const billNumberParam = this.activateRoute.snapshot.params["bill-number"];
    this.billNumber = +billNumberParam;
  }
}
