import { Component, OnInit } from "@angular/core";
import { Pagination } from "src/app/shared/models/pagination.model";
import { ToConfirmService } from "../services/to-confirm.service";
import { ExchangeService } from "src/app/shared/services/exchange.service";
import { ToConfirmRecords } from "../models/to-confirm.model";
import { TRANSLOCO_SCOPE, TranslocoService } from "@ngneat/transloco";

@Component({
  selector: "app-goods-confirm",
  templateUrl: "./goods-confirm.component.html",
  styleUrls: ["./goods-confirm.component.scss"],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: "parcel" }],
})
export class GoodsConfirmComponent implements OnInit {
  isDisplayModal: boolean = false;
  toConfirmList: ToConfirmRecords[] = [];
  confirmImage: File;

  pagination: Pagination;
  pageNumbers: number[];

  lotId: number;

  constructor(
    private toConfirmService: ToConfirmService,
    private exchangeService: ExchangeService,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    this.getToConfirmList();
  }

  getToConfirmList() {
    const body = {
      page: 1,
      pageSize: 10,
    };
    this.toConfirmService.getToConfirmList(body).subscribe(
      (res) => {
        this.toConfirmList = res.data.records;
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

  handleChangePage(pageNumber) {
    if (pageNumber !== this.pagination.page) {
      const body = {
        page: pageNumber,
        pageSize: 10,
      };
      this.toConfirmService.getToConfirmList(body).subscribe(
        (res) => {
          this.toConfirmList = res.data.records;
          this.pagination = res.data.pagination;
        },
        (err) => console.log(err)
      );
    }
  }

  openConfirmBox(lotId) {
    this.isDisplayModal = true;
    this.lotId = lotId;
  }
  handleUploadFile(event) {
    this.confirmImage = event.target.files[0];
  }

  handleSubmit() {
    if (this.confirmImage) {
      let body = new FormData();
      body.append("file", this.confirmImage);
      body.append("type", "confirm-image");
      this.exchangeService.uploadImageVerification(body).subscribe(
        (res) => {
          const imgUrl = res.data.url;
          const toConfirmParams = {
            lot_id: this.lotId,
            po_image: imgUrl,
          };
          this.toConfirmService.submitToConfirm(toConfirmParams).subscribe(
            (res) => {
              alert(this.transloco.translate("proof_submitted", {}, "parcel"));
              this.isDisplayModal = false;
              this.confirmImage = undefined;
            },
            (err) => {
              console.log(err);
              alert(this.transloco.translate("error_occurred_try_again"));
            }
          );
        },
        (err) => {
          console.log(err);
          alert(this.transloco.translate("error_occurred_try_again"));
        }
      );
    } else {
      alert(this.transloco.translate("upload_proof_required", {}, "parcel"));
    }
  }

  renderText(value) {
    if (value) {
      return value;
    }
    return "-";
  }
}
