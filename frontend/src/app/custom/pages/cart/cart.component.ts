import { Component, OnInit } from "@angular/core"
import { CartData, Shop } from "../../interfaces"
import { CartService } from "../../services"

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.scss"],
})
export class CartComponent implements OnInit {
  cartItems: Shop[] = []
  totalPrice: number = 0
  totalQuantity: number = 0
  grandTotalQuantity: number = 0
  currentInputQuantity: number = 0
  rate: number = 0
  isButtonDisabled: boolean = false
  isModalConfirmDisplay: boolean = false
  isLoadingIconDisplay: boolean = false

  product: CartData
  shop: Shop

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.subscribeGlobalVariables()
    this.getCartDataFromBackend()
  }

  subscribeGlobalVariables(): void {
    this.cartService
      .getCartItem()
      .subscribe((value) => (this.cartItems = value))

    this.cartService
      .getTotalPrice()
      .subscribe((value) => (this.totalPrice = value))

    this.cartService
      .getTotalQuantity()
      .subscribe((value) => (this.totalQuantity = value))

    this.cartService
      .getGrandTotalQuantity()
      .subscribe((value) => (this.grandTotalQuantity = value))

    this.cartService.getRate().subscribe((value) => (this.rate = value))

    this.cartService
      .getIsButtonDisabled()
      .subscribe((value) => (this.isButtonDisabled = value))
  }

  incrementItem(product: CartData): void {
    this.cartService.incrementItem(product)
  }

  decrementItem(product: CartData): void {
    this.cartService.decrementItem(product)
  }

  openConfirmDeleteModal(product: CartData, shop: Shop): void {
    this.isModalConfirmDisplay = true
    this.product = product
    this.shop = shop
  }

  closeConfirmDeleteModal(): void {
    this.isModalConfirmDisplay = false
  }

  deleteItem(): void {
    this.cartService.deleteItem(this.product, this.shop)
    this.isModalConfirmDisplay = false
  }

  selectItem(product: CartData): void {
    this.cartService.selectItem(product)
  }

  selectAllShopItems(elem: HTMLElement, shop: Shop): void {
    this.cartService.selectAllShopItems(elem, shop)
  }

  selectAllItems(elem: HTMLElement): void {
    this.cartService.selectAllItems(elem)
  }

  getCartDataFromBackend(): void {
    this.cartService.getCartDataFromBackend()
  }

  focusOutUpdate(value: string, product: CartData) {
    if (Number(this.currentInputQuantity) !== Number(value)) {
      this.cartService.focusOutUpdate(value, product)
    }
  }
}
