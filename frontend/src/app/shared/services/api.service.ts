import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { getAccessToken, getHttpHeadersWithContentType, btcBaseUrl } from "./config";
import { ApiResponse, HtmlContent } from '../interfaces'

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
