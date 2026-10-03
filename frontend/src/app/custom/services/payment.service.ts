import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { getAccessToken, baseUrl, getHttpHeadersValue, getHttpHeadersWithContentType } from "./config";
import { PaginationParams } from '../interfaces'

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  createPayment(body) {
    if (getAccessToken()) {
      return this.http.post(`${baseUrl}/payment/create`, body, {
        headers: getHttpHeadersValue(),
      });
    }
  }
}
