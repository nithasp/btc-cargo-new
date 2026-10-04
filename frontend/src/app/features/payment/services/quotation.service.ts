import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { getAccessToken, baseUrl, getHttpHeadersValue } from "./config";
import { Quotation } from "../interfaces";

@Injectable({
  providedIn: "root",
})
export class QuotationService {
  quotationList = new BehaviorSubject<Quotation[]>([]);

  constructor(private http: HttpClient) {}

  getQuotationList() {
    return this.quotationList.asObservable();
  }

  createQuotation(body) {
    if (getAccessToken()) {
      return this.http.post(`${baseUrl}/sale/quotation`, body, {
        headers: getHttpHeadersValue(),
      });
    }
  }
}
