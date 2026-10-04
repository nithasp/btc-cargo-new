import { HttpHeaders } from "@angular/common/http"
import { environment } from "../../../environments/environment"

export const btcBaseUrl: string = environment.apiUrl
export const baseUrl: string = `${btcBaseUrl}/api/odoo`

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
