import { Component, OnInit } from "@angular/core";
import { ApiService } from "src/app/custom/services/api.service";
import { CartService } from "src/app/custom/services/cart.service";

@Component({
  selector: "app-mockup-cart-data-page",
  templateUrl: "./mockup-cart-data-page.component.html",
  styleUrls: ["./mockup-cart-data-page.component.scss"],
})
export class MockupCartDataPageComponent implements OnInit {
  isLoading: boolean = true;
  cartData: any = [];
  cartItems: any = [];
  totalQuantity: Number = 0;

  constructor(
    private cartService: CartService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.getData();
    this.subscribeGlobalVariables();
  }

  subscribeGlobalVariables(): void {
    this.cartService
      .getCartItem()
      .subscribe((value) => (this.cartItems = value));

    this.cartService
      .getTotalQuantity()
      .subscribe((value) => (this.totalQuantity = value));
  }

  getData() {
    this.apiService.getData().subscribe((value) => {
      const cartData1 = value.map((item: any) => {
        return { ...item, quantity: 1, selected: false };
      });
      const cartData2 = cartData1.map((item: any) => {
        return { ...item, totalPrice: item.quantity * item.price };
      });

      this.cartData = cartData2;

      this.isLoading = false;
    });
  }

  addItem(product: any) {
    this.cartService.addItem(product);
  }
}
