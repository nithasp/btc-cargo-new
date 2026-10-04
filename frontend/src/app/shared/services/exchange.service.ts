import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { ApiResponse } from "../models/common.model"
import { ExchangeState } from "../models/exchange-money.model"
import { UploadFile } from "../models/upload.model"
import { CreatedVerificationItem } from "../models/verification.model"
import { Wallet } from "../models/wallet.model"
import {
  baseUrl,
  btcBaseUrl,
  getAccessToken,
  getHttpHeadersWithContentType,
} from "src/app/core/config/api-config"
@Injectable({
  providedIn: "root",
})
export class ExchangeService {
  constructor(private http: HttpClient) {}

  uploadImageVerification(body) {
    if (getAccessToken()) {
      const headers = new HttpHeaders({
        "Content-Disposition": "form-data",
        Authorization: `Token ${getAccessToken()}`,
      })
      return this.http.post<ApiResponse<UploadFile>>(
        `${btcBaseUrl}/api/upload/`,
        body,
        {
          headers: headers,
        }
      )
    }
  }

  createValidation(body) {
    if (getAccessToken()) {
      return this.http.post<ApiResponse<CreatedVerificationItem[]>>(
        `${baseUrl}/partner/create_verification`,
        body,
        {
          headers: getHttpHeadersWithContentType(),
        }
      )
    }
  }

  getExchangeState() {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<ExchangeState>>(
        `${baseUrl}/partner/me`,
        {
          headers: getHttpHeadersWithContentType(),
        }
      )
    }
  }
}
