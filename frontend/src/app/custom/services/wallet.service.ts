import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { ApiResponse, Wallet } from "../interfaces"
import {
  baseUrl,
  getAccessToken,
  getHttpHeadersWithContentType,
} from "./config"
@Injectable({
  providedIn: "root",
})
export class WalletService {
  constructor(private http: HttpClient) {}

  getWallets(params) {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<Wallet[]>>(`${baseUrl}/partner/wallet`, {
        headers: getHttpHeadersWithContentType(),
        params,
      })
    }
  }

  addWallet(body) {
    if (getAccessToken()) {
      return this.http.post<ApiResponse<Wallet[]>>(
        `${baseUrl}/partner/new_wallet`,
        body,
        {
          headers: getHttpHeadersWithContentType(),
        }
      )
    }
  }

  updateWallet(body) {
    if (getAccessToken()) {
      return this.http.post<ApiResponse<Wallet[]>>(
        `${baseUrl}/partner/update_wallet`,
        body,
        {
          headers: getHttpHeadersWithContentType(),
        }
      )
    }
  }
}
