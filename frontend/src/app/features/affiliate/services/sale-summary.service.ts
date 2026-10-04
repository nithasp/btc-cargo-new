import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  getAccessToken,
  baseUrl,
  getHttpHeadersValue,
} from "src/app/core/config/api-config";
import { ApiResponse } from "src/app/shared/models/common.model";
import { SaleSummaryResponse } from "../models/sale-summary.model";

@Injectable({
  providedIn: "root",
})
export class SaleSummaryService {
  constructor(private http: HttpClient) {}

  getSaleSummary(body) {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<SaleSummaryResponse>>(
        `${baseUrl}/sale/summary`,
        {
          headers: getHttpHeadersValue(),
          params: body,
        }
      );
    }
  }

  editDiscount(body) {
    if (getAccessToken()) {
      return this.http.post(`${baseUrl}/sale/order/discount`, body, {
        headers: getHttpHeadersValue(),
      });
    }
  }
}
