import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable } from "rxjs"
import { Address } from '../interfaces/address'

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
      return this.http.get<Address>("https://btc-uat.beonit.xyz/api/address/", {
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
        "https://btc-uat.beonit.xyz/api/address/",
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
        `https://btc-uat.beonit.xyz/api/address/${id}/`,
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
        `https://btc-uat.beonit.xyz/api/address/${addressId}/`,
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
        `https://btc-uat.beonit.xyz/api/address/${addressId}/`,
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
        `https://btc-uat.beonit.xyz/api/address/${id}/`,
        { headers: httpHeadersValue }
      )
    }
  }
}
