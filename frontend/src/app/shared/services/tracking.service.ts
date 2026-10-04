import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import {
  getAccessToken,
  baseUrl,
  getHttpHeadersValue,
} from "src/app/core/config/api-config"
import { ApiResponse } from "../models/master-data.model";
import {
  ChinaTrackingDetails,
  Details,
  TrackingValidation,
} from "../models/tracking.model";

@Injectable({
  providedIn: "root",
})
export class TrackingService {
  constructor(private http: HttpClient) {}

  createSaleChinaTrackingDetail(body) {
    if (getAccessToken()) {
      return this.http.post(`${baseUrl}/sale/china/tracking/register`, body, {
        headers: getHttpHeadersValue(),
      })
    }
  }

  updateSaleChinaTrackingDetail(body) {
    if (getAccessToken()) {
      return this.http.post(`${baseUrl}/sale/china/tracking/update`, body, {
        headers: getHttpHeadersValue(),
      })
    }
  }

  validateSaleChinaTrackingDetail(body) {
    if (getAccessToken()) {
      return this.http.post<ApiResponse<TrackingValidation>>(`${baseUrl}/sale/china/tracking/check`, body, {
        headers: getHttpHeadersValue(),
      })
    }
  }

  getSaleChinaTrackingDetail(body) {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<Details>>(`${baseUrl}/sale/china/tracking`, {
        headers: getHttpHeadersValue(),
        params: body,
      })
    }
  }

  getCreatedTrackingList(body) {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<ChinaTrackingDetails>>(`${baseUrl}/sale/china/tracking/list`, {
        headers: getHttpHeadersValue(),
        params: body,
      })
    }
  }
}
