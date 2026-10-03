import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiResponse, Details, Pagination, Quotation } from "../../interfaces";
import { QuotationService, TrackingService } from "../../services";

@Component({
  selector: "app-transport-payment",
  templateUrl: "./transport-payment.component.html",
  styleUrls: ["./transport-payment.component.scss"],
})
export class TransportPaymentComponent implements OnInit {
  bsValue: Date = new Date();
  isDisplayNoPendingPaymentChecked: boolean = false;

  pagination: Pagination;
  items: Quotation[] = [];
  pageNumbers: number[];

  totalQuantity: number = 0;
  totalWeight: number = 0;
  totalHeight: number = 0;
  totalWidth: number = 0;
  totalDepth: number = 0;
  totalVolume: number = 0;

  totalDeliveryCost: number = 0;
  totalPackingCost: number = 0;
  totalQcCost: number = 0;
  totalOtherCost: number = 0;
  totalStorageCost: number = 0;
  totalPrice: number = 0;

  constructor(
    private router: Router,
    private trackingService: TrackingService,
    private quotationService: QuotationService
  ) {}

  ngOnInit(): void {
    this.getDetails();
  }

  checkBox(item) {
    item.is_checked = !item.is_checked;
    this.calculate();
  }

  checkAllBox(elem): void {
    if (elem.checked) {
      this.items.map((item: Quotation) => {
        item.is_checked = true;
      });
    } else {
      this.items.map((item: Quotation) => {
        item.is_checked = false;
      });
    }

    this.calculate();
  }

  calculate() {
    const checkedItems = this.items.filter((item) => item.is_checked);
    const totalQuantity = checkedItems.reduce((acc: number, item: any) => {
      return (acc += item.lot.quantity);
    }, 0);
    const totalWeight = checkedItems.reduce((acc: number, item: any) => {
      return (acc += item.lot.total_weight);
    }, 0);
    const totalHeight = checkedItems.reduce((acc: number, item: any) => {
      return (acc += item.lot.height);
    }, 0);

    const totalWidth = checkedItems.reduce((acc: number, item: any) => {
      return (acc += item.lot.width);
    }, 0);

    const totalDepth = checkedItems.reduce((acc: number, item: any) => {
      return (acc += item.lot.depth);
    }, 0);

    const totalVolume = checkedItems.reduce((acc: number, item: any) => {
      return (acc += item.lot.total_volume);
    }, 0);

    const totalDeliveryCost = checkedItems.reduce((acc: number, item: any) => {
      return (acc += item.lot.delivery_cost);
    }, 0);
    const totalPackingCost = checkedItems.reduce((acc: number, item: any) => {
      return (acc += item.lot.packing_cost);
    }, 0);
    const totalQcCost = checkedItems.reduce((acc: number, item: any) => {
      if (item.lot.qc_cost) {
        return (acc += item.lot.qc_cost);
      }
      return acc;
    }, 0);
    const totalOtherCost = checkedItems.reduce((acc: number, item: any) => {
      return (acc += item.lot.other_cost);
    }, 0);
    const totalStorageCost = checkedItems.reduce((acc: number, item: any) => {
      return (acc += item.lot.storage_cost);
    }, 0);

    this.totalQuantity = totalQuantity;
    this.totalWeight = totalWeight.toFixed(2);
    this.totalHeight = totalHeight.toFixed(1);
    this.totalWidth = totalWidth.toFixed(1);
    this.totalDepth = totalDepth.toFixed(1);
    this.totalVolume = totalVolume.toFixed(4);

    this.totalDeliveryCost = totalDeliveryCost.toFixed(2);
    this.totalPackingCost = totalPackingCost.toFixed(1);
    this.totalQcCost = totalQcCost;
    this.totalOtherCost = totalOtherCost.toFixed(1);
    this.totalStorageCost = totalStorageCost;

    this.totalPrice = (
      totalDeliveryCost +
      totalPackingCost +
      totalOtherCost +
      totalStorageCost
    ).toFixed(2);

    if (checkedItems.length === 0) {
      this.totalQuantity = 0;
      this.totalWeight = 0;
      this.totalHeight = 0;
      this.totalWidth = 0;
      this.totalDepth = 0;
      this.totalVolume = 0;

      this.totalDeliveryCost = 0;
      this.totalPackingCost = 0;
      this.totalQcCost = 0;
      this.totalOtherCost = 0;
      this.totalStorageCost = 0;

      this.totalPrice = 0;
    }
  }

  isNoPendingPaymentChecked(): void {
    const unChecked = this.items.every((item: Quotation) => !item.is_checked);
    if (unChecked) {
      this.isDisplayNoPendingPaymentChecked = true;
    } else {
      const checkedItems = this.items.filter(
        (item: Quotation) => item.is_checked === true
      );
      this.quotationService.quotationList.next(checkedItems);
      this.router.navigate(["/web/create-bill"]);
    }
  }

  getDetails(): void {
    const body = {
      page: 1,
      pageSize: 10,
      is_ready: true,
    };
    this.trackingService.getSaleChinaTrackingDetail(body).subscribe(
      (response: ApiResponse<Details>) => {
        this.items = response.data.records.map((i) => {
          return { is_checked: false, ...i };
        });
        const { pagination } = response.data;
        this.pagination = pagination;
        this.pageNumbers = Array.from(
          { length: pagination.endPage },
          (_, index) => index + 1
        );
      },
      (error) => {
        console.log("error ", error);
      }
    );
  }

  handleChangePage(pageNumber) {
    const body = {
      page: pageNumber,
      pageSize: 10,
    };
    this.trackingService.getSaleChinaTrackingDetail(body).subscribe(
      (response: ApiResponse<Details>) => {
        this.items = response.data.records.map((i) => {
          return { is_checked: false, ...i };
        });
        this.pagination = response.data.pagination;
        this.pageNumbers = Array.from(
          { length: response.data.pagination.endPage },
          (_, index) => index + 1
        );
      },
      (error) => {
        console.log("error ", error);
      }
    );
  }

  getWeight(value) {
    if (value) {
      return value.reduce((acc, item) => {
        return (acc += item.weight);
      }, 0);
    }
    return "-";
  }

  getTotalWeight(value, totalAmount) {
    if (value) {
      const totalWeight = value.reduce((acc, item) => {
        return (acc += item.weight);
      }, 0);
      return totalWeight * totalAmount;
    }
    return "-";
  }

  getOtherCost(packingCost, qcCost, extraCost) {
    if (packingCost && qcCost && extraCost) {
      return (packingCost + qcCost + extraCost).toFixed(2);
    }
    return "-";
  }

  getTotalCost(chinaTrackingPrice, packingCost, qcCost, extraCost) {
    if (chinaTrackingPrice && packingCost && qcCost && extraCost) {
      return (chinaTrackingPrice + packingCost + qcCost + extraCost).toFixed(2);
    }
    return "-";
  }

  renderText(value) {
    if (value) {
      return value;
    }
    if (value === 0) {
      return value;
    }
    return "-";
  }
  renderTotalWeight(value) {
    if (value) {
      return value.toFixed(2);
    }
    return "-";
  }
}
