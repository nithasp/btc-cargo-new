import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  btcBaseUrl,
  getAccessToken,
  getHttpHeadersValue,
} from "src/app/core/config/api-config";
import { CartData } from "../models/cart.model";

@Injectable({
  providedIn: "root",
})
export class ProductConsignmentService {
  constructor(private http: HttpClient) {}

  getProduct() {
    if (getAccessToken()) {
      return this.http.get<CartData[]>(`${btcBaseUrl}/api/product/`, {
        headers: getHttpHeadersValue(),
      });
    }
  }
}
