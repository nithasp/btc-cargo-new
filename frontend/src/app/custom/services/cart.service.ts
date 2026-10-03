import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ApiService } from "./api.service";
import { AuthService } from "./auth.service";
import { CartData } from "../interfaces/cart";
import { Shop } from "../interfaces/shop";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class CartService {
  baseUrl: string = this.apiService.baseUrl;
  cartItemsMock: Shop[] = [];
  cartItems = new BehaviorSubject<Shop[]>([]);
  totalPrice = new BehaviorSubject<number>(0);
  totalQuantity = new BehaviorSubject<number>(0);
  grandTotalQuantity = new BehaviorSubject<number>(0);
  rate = new BehaviorSubject<number>(5.59);
  isButtonDisabled = new BehaviorSubject<boolean>(false);
  isLoadingIconDisplay = new BehaviorSubject<boolean>(false);
  isAlertMsgBoxDisplay = new BehaviorSubject<boolean>(false);
  timeout: any;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  addItem(item: CartData) {
    const isShopExist = this.cartItemsMock.find(
      (x: Shop) => x.shop_id === item.shop
    );

    if (isShopExist) {
      const existingProduct = isShopExist.products.find((x: CartData) => {
        return x.id === item.id;
      });
      if (existingProduct) {
        const existingType = isShopExist.products.find((x: CartData) => {
          if (x.id === item.id) {
            return x.variants.id === item.variants.id;
          }
        });
        if (!existingType) {
          isShopExist.products.push(item);
        }
      } else {
        isShopExist.products.push(item);
      }
    } else {
      const newShop = {
        shop_id: item.shop,
        shop_name: item.shop_name,
        products: [{ ...item }],
      };
      this.cartItemsMock.push(newShop);
    }

    const cartItemsFilter = this.cartItemsMock.filter(
      (x: any) => x.products.length > 0
    );
    this.cartItems.next(cartItemsFilter);

    this.updateBackendCart(item);
  }

  incrementItem(product: CartData) {
    product.quantity += 1;
    this.updateBackendCart(product);
  }

  decrementItem(product: CartData) {
    if (product.quantity > 1) {
      product.quantity -= 1;
    }
    this.updateBackendCart(product);
  }

  deleteItem(product: CartData, shop: Shop) {
    const filterShopProduct = shop.products.filter((x: CartData) => {
      if (product.variants.id === -1) {
        return x.id !== product.id;
      } else {
        return (x.id && x.variants.id) !== (product.id && product.variants.id);
      }
    });
    shop.products = filterShopProduct;

    const filterCartItemsProduct = this.cartItemsMock.filter(
      (x: Shop) => x.products.length > 0
    );
    this.cartItems.next(filterCartItemsProduct);
    this.updateBackendCart(product);
  }

  selectItem(product: CartData) {
    product.selected = !product.selected;
    this.calculateTotalPrice();
  }

  selectAllShopItems(elem: any, shop: Shop) {
    if (elem.checked) {
      shop.products.map((item: any) => (item.selected = true));
    } else {
      shop.products.map((item: any) => (item.selected = false));
    }
    this.calculateTotalPrice();
  }

  selectAllItems(elem: any) {
    const allCheckBox = document.querySelectorAll(
      ".shop input[type='checkbox']"
    );
    if (elem.checked) {
      allCheckBox.forEach((checkbox: any) => (checkbox.checked = true));
      this.cartItemsMock.map((x: any) => {
        return x.products.map((y: any) => (y.selected = true));
      });
    } else {
      allCheckBox.forEach((checkbox: any) => (checkbox.checked = false));
      this.cartItemsMock.map((x: any) => {
        return x.products.map((y: any) => (y.selected = false));
      });
    }
    this.calculateTotalPrice();
  }

  calculateTotalPrice() {
    // Total Price
    const getTotalPrice = this.cartItemsMock.map((x: any) => {
      return x.products.reduce((acc: any, item: any) => {
        if (item.selected) {
          return (acc += item.totalPrice);
        }
        return (acc += 0);
      }, 0);
    });
    const totalPriceValue = getTotalPrice.reduce((acc: any, item: any) => {
      return (acc += item);
    }, 0);

    // Total Quantity
    const getTotalQuantity = this.cartItemsMock.map((x: any) => {
      return x.products.length;
    });
    const totalQuantityValue = getTotalQuantity.reduce(
      (acc: any, item: any) => {
        return (acc += item);
      },
      0
    );

    // Grand Total Quantity
    const getGrandTotalQuantity = this.cartItemsMock.map((x: any) => {
      return x.products.reduce((acc: any, item: any) => {
        return (acc += item.quantity);
      }, 0);
    });
    const grandTotalQuantityValue = getGrandTotalQuantity.reduce(
      (acc: any, item: any) => {
        return (acc += item);
      },
      0
    );

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
    this.grandTotalQuantity.next(grandTotalQuantityValue);
  }

  focusOutUpdate(value: string, product: CartData) {
    product.quantity = Number(value);
    this.updateBackendCart(product);
  }

  resetSelectedItem() {
    this.cartItemsMock.map((item) => {
      item.products.map((item2) => {
        item2.selected = false;
      });
    });
  }

  getCartItem() {
    return this.cartItems.asObservable();
  }

  getTotalPrice() {
    return this.totalPrice.asObservable();
  }

  getTotalQuantity() {
    return this.totalQuantity.asObservable();
  }

  getGrandTotalQuantity() {
    return this.grandTotalQuantity.asObservable();
  }

  getRate() {
    return this.rate.asObservable();
  }

  getIsButtonDisabled() {
    return this.isButtonDisabled.asObservable();
  }

  getBackendCartUpdate() {
    return this.isLoadingIconDisplay.asObservable();
  }

  getIsAlertMsgBoxDisplay() {
    return this.isAlertMsgBoxDisplay.asObservable();
  }

  getCartDataFromBackend() {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      const httpHeadersValue = new HttpHeaders({
        "content-type": "application/json",
        Authorization: `Token ${accessToken}`,
      });
      this.http
        .get<any>(`${this.baseUrl}/api/cart/`, {
          headers: httpHeadersValue,
        })
        .subscribe(
          (res) => {
            if (res.length > 0) {
              this.cartItemsMock = res[0].json;
              this.cartItems.next(this.cartItemsMock);
              this.calculateTotalPrice();
              this.resetSelectedItem();
            } else {
              this.cartItemsMock = [];
              this.cartItems.next(this.cartItemsMock);
              this.calculateTotalPrice();
            }
          },
          (err) => {
            console.log(err, err.error.detail);
            alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง");
          }
        );
    }
  }

  updateBackendCart(product: CartData) {
    this.isButtonDisabled.next(true);
    const item = {
      json: this.cartItems["_value"],
      user: this.authService.userId["_value"],
    };

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const httpHeadersValue = new HttpHeaders({
          "content-type": "application/json",
          Authorization: `Token ${accessToken}`,
        });

        this.http
          .get<any>(`${this.baseUrl}/api/cart/`, {
            headers: httpHeadersValue,
          })
          .subscribe(
            (res) => {
              product.totalPrice = product.quantity * product.price;
              if (res.length > 0) {
                const cartId = res[0].id;
                this.http
                  .put<any>(`${this.baseUrl}/api/cart/${cartId}/`, item, {
                    headers: httpHeadersValue,
                  })
                  .subscribe(
                    (res) => {
                      this.calculateTotalPrice();
                      this.isButtonDisabled.next(false);
                      this.isLoadingIconDisplay.next(false);
                      this.isAlertMsgBoxDisplay.next(true);
                    },
                    (err) => {
                      console.log(err, err.error.detail);
                      alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง");
                      this.isLoadingIconDisplay.next(false);
                    }
                  );
              } else {
                this.http
                  .post<any>(`${this.baseUrl}/api/cart/`, item, {
                    headers: httpHeadersValue,
                  })
                  .subscribe(
                    (res) => {
                      this.calculateTotalPrice();
                      this.isButtonDisabled.next(false);
                      this.isLoadingIconDisplay.next(false);
                      this.isAlertMsgBoxDisplay.next(true);
                    },
                    (err) => {
                      console.log(err, err.error.detail);
                      alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง");
                      this.isLoadingIconDisplay.next(false);
                    }
                  );
              }
            },
            (err) => {
              console.log(err, err.error.detail);
              alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง");
            }
          );
      }
    }, 500);
  }
}
