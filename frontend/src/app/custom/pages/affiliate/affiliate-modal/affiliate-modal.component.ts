import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { AffiliateService, ExchangeService } from "../../../services";
import { AffiliateModal } from "src/app/custom/interfaces";
import { TRANSLOCO_SCOPE, TranslocoService } from "@ngneat/transloco";
@Component({
  selector: "affiliate-modal",
  templateUrl: "./affiliate-modal.component.html",
  styleUrls: ["./affiliate-modal.component.scss"],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: "affiliate" }],
})
export class AffiliateModalComponent implements OnInit {
  @Output() isMainContentDisplay = new EventEmitter<AffiliateModal>();

  idCardFile: File;
  consentFile: File;

  uploadUrl: string = "";
  consentUrl: string = "";

  verificationState: string = "unverified";
  isModalDisplay: boolean = false;

  constructor(
    private affiliateService: AffiliateService,
    private exchangeService: ExchangeService,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    this.getAffiliateDetail();
  }

  getAffiliateDetail() {
    this.affiliateService.getAffiliateDetail().subscribe((res) => {
      this.verificationState = res.data.verification_state;
      if (this.verificationState === "verified") {
        this.isModalDisplay = false;
        this.affiliateService.teamId.next(res.data.team_id);

        this.affiliateService
          .getAffiliateTeamDetail(res.data.team_id)
          .subscribe((value) => {
            this.setMainContentDisplay(true, value.data);
          });
      } else {
        this.isModalDisplay = true;
        this.setMainContentDisplay(false, undefined);
      }
    });
  }

  setMainContentDisplay(verificationState, teamData) {
    this.isMainContentDisplay.emit({
      verificationState,
      teamData,
    });
  }

  handleUploadFile(event, type) {
    if (type === "idCard") {
      this.idCardFile = event.target.files[0];
    }
    if (type === "consent") {
      this.consentFile = event.target.files[0];
    }
  }

  handleSubmit() {
    if (this.idCardFile && this.consentFile) {
      let body1 = new FormData();
      body1.append("file", this.idCardFile, this.idCardFile.name);
      body1.append("type", "payment");
      this.exchangeService.uploadImageVerification(body1).subscribe(
        (res1) => {
          this.uploadUrl = res1.data.url;
          let body2 = new FormData();
          body2.append("file", this.consentFile, this.consentFile.name);
          body2.append("type", "payment");
          this.exchangeService.uploadImageVerification(body2).subscribe(
            (res2) => {
              this.consentUrl = res2.data.url;
              const body3 = {
                upload_url: this.uploadUrl,
                consent_url: this.consentUrl,
              };
              this.createVerification(body3);
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
      alert(this.transloco.translate("upload_all_images", {}, "affiliate"));
    }
  }

  createVerification(body) {
    this.affiliateService.createVerification(body).subscribe(
      (res) => {
        this.verificationState = "reviewing";
      },
      (err) => console.log(err)
    );
  }
}
