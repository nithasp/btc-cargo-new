import { HttpHeaders } from "@angular/common/http"

export const baseUrl: string = "https://btc-uat.beonit.xyz/api/odoo"
export const btcBaseUrl: string = "https://btc-uat.beonit.xyz"

export const getAccessToken = (): string => {
  return localStorage.getItem("accessToken")
}

export const getHttpHeadersValue = () => {
  return new HttpHeaders({
    "content-type": "application/json",
    Authorization: `Token ${getAccessToken()}`,
  })
}

export const getHttpHeadersWithContentType = () => {
  return new HttpHeaders({
    "Content-Type": "application/json",
    Authorization: `Token ${getAccessToken()}`,
  })
}