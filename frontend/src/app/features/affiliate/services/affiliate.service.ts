import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  getAccessToken,
  baseUrl,
  getHttpHeadersValue,
} from "src/app/core/config/api-config";
import { BehaviorSubject } from "rxjs";
import { ApiResponse } from "src/app/shared/models/master-data.model";
import { AffiliateMe, AffiliateTeam } from "../models/affiliate.model";

@Injectable({
  providedIn: "root",
})
export class AffiliateService {
  teamId = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  getAffiliateDetail() {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<AffiliateMe>>(
        `${baseUrl}/affiliate/me`,
        {
          headers: getHttpHeadersValue(),
        }
      );
    }
  }

  getAffiliateTeamDetail(body) {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<AffiliateTeam>>(
        `${baseUrl}/affiliate/team`,
        {
          headers: getHttpHeadersValue(),
          params: body,
        }
      );
    }
  }

  createVerification(body) {
    if (getAccessToken()) {
      return this.http.post(`${baseUrl}/affiliate/create_verification`, body, {
        headers: getHttpHeadersValue(),
      });
    }
  }

  createAffiliate(body) {
    if (getAccessToken()) {
      return this.http.post(`${baseUrl}/affiliate/manage`, body, {
        headers: getHttpHeadersValue(),
      });
    }
  }

  getTeamId() {
    return this.teamId.asObservable();
  }
}
