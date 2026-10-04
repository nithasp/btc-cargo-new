import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable } from "rxjs"
import { UserInfo } from "../models/user-information.model"
import { btcBaseUrl } from "src/app/core/config/api-config"

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(): Observable<UserInfo> {
    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
      const httpHeadersValue = new HttpHeaders({
        "content-type": "application/json",
        Authorization: `Token ${accessToken}`,
      })
      return this.http.get<UserInfo>(`${btcBaseUrl}/api/user/`, {
        headers: httpHeadersValue,
      })
    }
  }

  updateUser(user: Partial<UserInfo>) {
    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
      const httpHeadersValue = new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: `Token ${accessToken}`,
      })
      return this.http.put<Partial<UserInfo>>(
        `${btcBaseUrl}/api/user/`,
        user,
        { headers: httpHeadersValue }
      )
    }
  }
}
