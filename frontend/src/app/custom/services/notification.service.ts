import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { getAccessToken, btcBaseUrl, getHttpHeadersValue } from "./config";
import { NotificationApiResponse, NotificationData } from "../interfaces";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  constructor(private http: HttpClient) {}

  getNotification(pageNumber) {
    if (getAccessToken()) {
      return this.http.get<NotificationApiResponse<NotificationData>>(
        `${btcBaseUrl}/api/notification/unread/?page=${pageNumber}`,
        {
          headers: getHttpHeadersValue(),
        }
      );
    }
  }

  markAllReadNotification() {
    if (getAccessToken()) {
      return this.http.post(
        `${btcBaseUrl}/api/notification/mark_all_read/`,
        "",
        {
          headers: getHttpHeadersValue(),
        }
      );
    }
  }
}
