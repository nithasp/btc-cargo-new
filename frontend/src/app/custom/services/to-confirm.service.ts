import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { getAccessToken, baseUrl, getHttpHeadersValue } from "./config";
import { ApiResponse, ToConfirmResponse } from "../interfaces";

@Injectable({
  providedIn: "root",
})
export class ToConfirmService {
  constructor(private http: HttpClient) {}

  getToConfirmList(body) {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<ToConfirmResponse>>(
        `${baseUrl}/to/confirm`,
        {
          headers: getHttpHeadersValue(),
          params: body,
        }
      );
    }
  }

  submitToConfirm(body) {
    if (getAccessToken()) {
      return this.http.post(`${baseUrl}/to/confirm/submit`, body, {
        headers: getHttpHeadersValue(),
      });
    }
  }
}
