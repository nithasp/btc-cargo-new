import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable } from "rxjs"
import { Address } from '../models/address.model'
import { btcBaseUrl } from "src/app/core/config/api-config"

@Injectable({
  providedIn: "root",
})
export class AddressService {
  constructor(private http: HttpClient) {}

  getAddress(): Observable<Address> {
    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
      const httpHeadersValue = new HttpHeaders({
        "content-type": "application/json",
        Authorization: `Token ${accessToken}`,
      })
      return this.http.get<Address>(`${btcBaseUrl}/api/address/`, {
        headers: httpHeadersValue,
      })
    }
  }

  createAddress(address: Address) {
    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
      const httpHeadersValue = new HttpHeaders({
        "content-type": "application/json",
        Authorization: `Token ${accessToken}`,
      })
      return this.http.post<Address>(
        `${btcBaseUrl}/api/address/`,
        address,
        { headers: httpHeadersValue }
      )
    }
  }

  readAddress(id: number) {
    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
      const httpHeadersValue = new HttpHeaders({
        "content-type": "application/json",
        Authorization: `Token ${accessToken}`,
      })
      return this.http.get<Address>(
        `${btcBaseUrl}/api/address/${id}/`,
        { headers: httpHeadersValue }
      )
    }
  }

  updateAddress(address: Address, addressId: number) {
    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
      const httpHeadersValue = new HttpHeaders({
        "content-type": "application/json",
        Authorization: `Token ${accessToken}`,
      })
      return this.http.put<Address>(
        `${btcBaseUrl}/api/address/${addressId}/`,
        address,
        { headers: httpHeadersValue }
      )
    }
  }

  updatePartialAddress(address: Address, addressId: number) {
    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
      const httpHeadersValue = new HttpHeaders({
        "content-type": "application/json",
        Authorization: `Token ${accessToken}`,
      })
      return this.http.patch<Address>(
        `${btcBaseUrl}/api/address/${addressId}/`,
        address,
        { headers: httpHeadersValue }
      )
    }
  }

  deleteAddress(id: number) {
    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
      const httpHeadersValue = new HttpHeaders({
        "content-type": "application/json",
        Authorization: `Token ${accessToken}`,
      })
      return this.http.delete<Address>(
        `${btcBaseUrl}/api/address/${id}/`,
        { headers: httpHeadersValue }
      )
    }
  }
}
