import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { ApiResponse, CurrencyServiceStatus, PaymentCurrencyResponse } from "../interfaces"
import {
  baseUrl,
  getAccessToken,
  getHttpHeadersWithContentType,
} from "./config"
@Injectable({
  providedIn: "root",
})
export class CurrencyService {
  constructor(private http: HttpClient) {}

  getCurrencyServiceStatus(params) {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<CurrencyServiceStatus>>(
        `${baseUrl}/currencies/status`,
        {
          headers: getHttpHeadersWithContentType(),
          params,
        }
      )
    }
  }

  getCurrency(params) {
    if (getAccessToken()) {
        return this.http.get<ApiResponse<PaymentCurrencyResponse[]>>(
          `${baseUrl}/currencies/payment`,
          {
            headers: getHttpHeadersWithContentType(),
            params,
          }
        )
      }
  }
}
