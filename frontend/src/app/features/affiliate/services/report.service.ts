import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { btcBaseUrl, getAccessToken, getHttpHeadersValue } from "./config";
import { ApiResponse, Report } from "../interfaces";

@Injectable({
  providedIn: "root",
})
export class ReportService {
  constructor(private http: HttpClient) {}

  getReport(reportName) {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<Report>>(
        `${btcBaseUrl}/api/report/${reportName}/`,
        {
          headers: getHttpHeadersValue(),
        }
      );
    }
  }
}
