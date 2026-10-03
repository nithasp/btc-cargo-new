import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ReportService } from "../../../services";
import * as dayjs from "dayjs";

@Component({
  selector: "app-overview-manage-agent",
  templateUrl: "./overview-manage-agent.component.html",
  styleUrls: ["./overview-manage-agent.component.scss"],
})
export class OverviewManageAgentComponent implements OnInit {
  isMainContentDisplay: boolean = false;

  idCardFile: File;
  consentFile: File;
  uploadUrl: string = "";
  consentUrl: string = "";

  report1;
  report2;
  report1Url;
  report2Url;

  constructor(
    private domSanitizer: DomSanitizer,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.getReport();
  }

  setMainContentDisplay(value) {
    if (value.verificationState === true) {
      this.isMainContentDisplay = value.verificationState;
    }
  }

  getReport() {
    const startDate = dayjs().subtract(1, "month").format("YYYY-MM-DD");
    const endDate = dayjs().format("YYYY-MM-DD");
    const startEndDate = `?start_date=${startDate}&end_date=${endDate}`;

    const getReport1 = () => {
      this.reportService.getReport("aff_report_1").subscribe(
        (res) => {
          this.report1 = res;
          const safeReport1Url =
            this.domSanitizer.bypassSecurityTrustResourceUrl(
              `${res.data.report_url}${startEndDate}`
            );
          this.report1Url = safeReport1Url;
        },
        (err) => {
          console.log(err);
        }
      );
    };
    const getReport2 = () => {
      this.reportService.getReport("aff_report_2").subscribe(
        (res) => {
          this.report2 = res;
          const safeReport2Url =
            this.domSanitizer.bypassSecurityTrustResourceUrl(
              `${res.data.report_url}${startEndDate}`
            );
          this.report2Url = safeReport2Url;
        },
        (err) => {
          console.log(err);
        }
      );
    };
    getReport1();
    getReport2();
  }
}
