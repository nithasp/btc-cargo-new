import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable } from "rxjs"
import { UserInfo } from "../interfaces/user-information"

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
      return this.http.get<UserInfo>("https://btc-uat.beonit.xyz/api/user/", {
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
        `https://btc-uat.beonit.xyz/api/user/`,
        user,
        { headers: httpHeadersValue }
      )
    }
  }
}
