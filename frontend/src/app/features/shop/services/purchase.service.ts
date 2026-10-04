import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable } from "rxjs"
import { Product } from "../interfaces/product"
import { btcBaseUrl } from "./config"

@Injectable({
  providedIn: "root",
})
export class PurchaseService {
  constructor(private http: HttpClient) {}

  getProduct(url: string): Observable<Product> {
    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
      const httpHeadersValue = new HttpHeaders({
        "content-type": "application/json",
        Authorization: `Token ${accessToken}`,
      })
      return this.http.post<Product>(
        `${btcBaseUrl}/api/nextship/get`,
        {
          url: url,
          mock: "true",
        },
        { headers: httpHeadersValue }
      )
    }
  }
}
