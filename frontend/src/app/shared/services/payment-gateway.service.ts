import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse, Account, ExchangeMoneyActiveStage, PaymentMethod } from "../interfaces";
import {
  PaymentGatewayApiReponse,
  PaymentGatewayRecords
} from "../interfaces/payment-gateway";
import { baseUrl, getAccessToken, getHttpHeadersValue, getHttpHeadersWithContentType } from "./config";

@Injectable({
  providedIn: "root",
})
export class PaymentGatewayService {
  constructor(private http: HttpClient) {}

  getPaymentGateway(body) {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<PaymentGatewayApiReponse>>(
        `${baseUrl}/payment_gateway/list`,
        {
          headers: getHttpHeadersValue(),
          params: body,
        }
      );
    }
  }
  getPaymentGatewayDetail(id) {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<PaymentGatewayRecords>>(
        `${baseUrl}/payment_gateway/${id}`,
        {
          headers: getHttpHeadersValue(),
        }
      );
    }
  }

  getAlipayAccounts() {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<Account[]>>(`${baseUrl}/config/payment_gateway/alipay_account`, {
        headers: getHttpHeadersWithContentType(),
      })
    }
  }

  createPaymentGateway(body, params) {
    if (getAccessToken()) {
      return this.http.post<ApiResponse<any>>(`${baseUrl}/payment_gateway/payment`, body, {
        headers: getHttpHeadersWithContentType(),
        params
      })
    }
  }
}
