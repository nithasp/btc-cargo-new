import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  btcBaseUrl,
  getAccessToken,
  getHttpHeadersValue,
} from "src/app/core/config/api-config";
import { ApiResponse } from "src/app/shared/models/common.model";
import { Report } from "../models/report.model";

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
