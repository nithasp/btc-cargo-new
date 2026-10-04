import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  getAccessToken,
  baseUrl,
  getHttpHeadersValue,
  getHttpHeadersWithContentType,
} from "src/app/core/config/api-config";
import { PaginationParams } from 'src/app/shared/models/pagination.model'

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
