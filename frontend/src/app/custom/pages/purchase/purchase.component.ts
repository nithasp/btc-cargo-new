import { Component, OnInit } from "@angular/core"
import { PurchaseService } from "../../services"

@Component({
  selector: "app-purchase",
  templateUrl: "./purchase.component.html",
  styleUrls: ["./purchase.component.scss"],
})
export class PurchaseComponent implements OnInit {
  selectedSize: string
  selectedColor: string
  selectedSizeId: string
  selectedColorId: string
  amount: number = 1
  url: string = ""
  product: any
  selectedImg: number = 0
  price: number
  originalPrice: number

  constructor(private purchaseService: PurchaseService) {}

  ngOnInit(): void {}

  getProduct() {
    this.purchaseService.getProduct(this.url).subscribe((response: any) => {
      this.product = response.item
      this.price = this.product.price
      this.originalPrice = this.product.original_price
    })
  }

  onSelectSize(name: string, id: string) {
    this.selectedSize = name
    this.selectedSizeId = id
    if (this.selectedColor) {
      const item_name = `20509:${this.selectedSizeId};1627207:${this.selectedColorId}`
      const item = this.product.sku.find(
        (item) => (item.properties = item_name)
      )
      this.price = item.price
      this.originalPrice = item.orginal_price
    }
  }

  onSelectColor(name: string, id: string) {
    this.selectedColor = name
    this.selectedColorId = id
    if (this.selectedSize) {
      const item_name = `20509:${this.selectedSizeId};1627207:${this.selectedColorId}`
      const item = this.product.sku.find(
        (item) => (item.properties = item_name)
      )
      this.price = item.price
      this.originalPrice = item.orginal_price
    }
  }

  addAmount() {
    this.amount = this.amount + 1
  }

  removeAmount() {
    if (this.amount > 1) {
      this.amount = this.amount - 1
    }
  }
}
