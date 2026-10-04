import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../models/master-data.model";
import {
  ExchangeMoneyActiveStage,
  PaymentMethod,
} from "../models/exchange-money.model";
import {
  Account,
  PaymentGatewayApiReponse,
  PaymentGatewayRecords
} from "../models/payment-gateway.model";
import {
  baseUrl,
  getAccessToken,
  getHttpHeadersValue,
  getHttpHeadersWithContentType,
} from "src/app/core/config/api-config";

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
