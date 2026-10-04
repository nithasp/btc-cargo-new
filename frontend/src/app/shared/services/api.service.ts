import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  getAccessToken,
  getHttpHeadersWithContentType,
  btcBaseUrl,
} from "src/app/core/config/api-config";
import { ApiResponse } from '../models/common.model'
import { HtmlContent } from '../models/content.model'

@Injectable({
  providedIn: "root",
})
export class ApiService {
  baseUrl: string = btcBaseUrl;

  constructor(private http: HttpClient) {}

  getData() {
    return this.http.get<any>(`${btcBaseUrl}/api/product/cart-test/`, {
      headers: getHttpHeadersWithContentType(),
    });
  }

  getConsent() {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<HtmlContent>>(`${btcBaseUrl}/api/consent/`, {
        headers: getHttpHeadersWithContentType(),
      })
    }
  }

  getHtmlContent(key: string) {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<HtmlContent>>(`${btcBaseUrl}/api/banner/${key}/`, {
        headers: getHttpHeadersWithContentType(),
      })
    }
  }
}
