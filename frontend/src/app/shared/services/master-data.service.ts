import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { getAccessToken, baseUrl, getHttpHeadersValue } from "./config";
import {
  ApiResponse,
  System,
  ProductType,
  StockPickingType,
  StockLocation,
  ShopType,
  ThaiCarrier,
  DeliveryType,
  LocalDelivery,
} from "../interfaces/master-data";

@Injectable({
  providedIn: "root",
})
export class MasterDataService {
  constructor(private http: HttpClient) {}

  getConfigSystem() {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<System>>(`${baseUrl}/config/system`, {
        headers: getHttpHeadersValue(),
        params: {},
      });
    }
  }

  getProductTypes() {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<ProductType[]>>(
        `${baseUrl}/config/product_types`,
        {
          headers: getHttpHeadersValue(),
          params: {},
        }
      );
    }
  }

  getStockPickingType() {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<StockPickingType[]>>(
        `${baseUrl}/config/stock_picking_type`,
        {
          headers: getHttpHeadersValue(),
          params: {},
        }
      );
    }
  }

  getStockLocations() {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<StockLocation[]>>(
        `${baseUrl}/config/locations`,
        {
          headers: getHttpHeadersValue(),
          params: {},
        }
      );
    }
  }

  getShopTypes() {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<ShopType[]>>(
        `${baseUrl}/config/shop_types`,
        {
          headers: getHttpHeadersValue(),
          params: {},
        }
      );
    }
  }

  getThaiCarriers() {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<ThaiCarrier[]>>(
        `${baseUrl}/config/carrier/thai`,
        {
          headers: getHttpHeadersValue(),
          params: {},
        }
      );
    }
  }

  getDeliveryType() {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<DeliveryType[]>>(
        `${baseUrl}/config/delivery_type`,
        {
          headers: getHttpHeadersValue(),
          params: {},
        }
      );
    }
  }

  getLocalDelivery() {
    if (getAccessToken()) {
      return this.http.get<ApiResponse<LocalDelivery[]>>(
        `${baseUrl}/config/local_delivery`,
        {
          headers: getHttpHeadersValue(),
          params: {},
        }
      );
    }
  }
}
