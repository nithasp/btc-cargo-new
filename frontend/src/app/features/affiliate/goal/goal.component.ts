import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ReportService } from "../../../services";
import * as dayjs from "dayjs";
@Component({
  selector: "app-goal",
  templateUrl: "./goal.component.html",
  styleUrls: ["./goal.component.scss"],
})
export class GoalComponent implements OnInit {
  goalReport;
  goalReportUrl;
  isMainContentDisplay: boolean = false;

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

    const getGoalReport = () => {
      this.reportService.getReport("aff_goal_report").subscribe(
        (res) => {
          this.goalReport = res;
          const safeGoalReportUrl =
            this.domSanitizer.bypassSecurityTrustResourceUrl(
              `${res.data.report_url}${startEndDate}`
            );
          this.goalReportUrl = safeGoalReportUrl;
        },
        (err) => {
          console.log(err);
        }
      );
    };
    getGoalReport();
  }
}
