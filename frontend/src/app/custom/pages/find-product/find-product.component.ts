import { Component, OnInit } from "@angular/core"
import { CartService, ProductConsignmentService } from "src/app/custom/services"
import { CartData, ProductData, Uploads, Variants } from "../../interfaces/cart"

@Component({
  selector: "app-find-product",
  templateUrl: "./find-product.component.html",
  styleUrls: ["./find-product.component.scss"],
})
export class FindProductComponent implements OnInit {
  isLoading: boolean = true
  cartData: CartData[] = []
  totalQuantity: number = 0
  isButtonDisabled: boolean = false
  isAlertMsgBoxDisplay: boolean = false

  productFiltered: CartData
  isShopExist: boolean = true
  isShopHasProduct: boolean = true

  constructor(
    private cartService: CartService,
    private productConsignmentService: ProductConsignmentService
  ) {}

  ngOnInit(): void {
    this.getData()
    this.subscribeGlobalVariables()
    this.cartService.isAlertMsgBoxDisplay.next(false)
  }

  subscribeGlobalVariables(): void {
    this.cartService
      .getTotalQuantity()
      .subscribe((value) => (this.totalQuantity = value))

    this.cartService
      .getIsButtonDisabled()
      .subscribe((value) => (this.isButtonDisabled = value))

    this.cartService
      .getIsAlertMsgBoxDisplay()
      .subscribe((value) => (this.isAlertMsgBoxDisplay = value))
  }

  getData(): void {
    this.productConsignmentService.getProduct().subscribe(
      (res) => {
        if (res.length === 0) {
          this.isLoading = false
          this.isShopHasProduct = false
        } else {
          const newCartData1 = res.map((item: any) => {
            return {
              ...item,
              quantity: 1,
              selected: false,
              price: Number(item.price),
            }
          })
          const newCartData2 = newCartData1.map((item: CartData) => {
            return { ...item, totalPrice: item.quantity * item.price }
          })
          this.cartData = newCartData2
          this.isLoading = false
          this.cartService.getCartDataFromBackend()
        }
      },
      (err) => {
        console.log(err)
        this.isLoading = false
        this.isShopExist = false
      }
    )
  }

  addItem(product: CartData, variantsValue: string): void {
    if (variantsValue === "ไม่มีตัวเลือก") {
      this.productFiltered = {
        ...product,
        uploads: product.uploads[0] ?? null,
        variants: product.variants[0] ?? { id: -1 },
      }
    }
    this.cartService.isLoadingIconDisplay.next(true)
    this.cartService.addItem(this.productFiltered)
  }

  closeAlertMsgBox(): void {
    this.cartService.isAlertMsgBoxDisplay.next(false)
  }

  handleVariants(
    product: ProductData,
    variants: Variants,
    variantsRef: HTMLElement,
    priceRef: HTMLElement,
    productImgRef: HTMLImageElement
  ): void {
    const matchType = product.uploads.find(
      (x: Uploads) => x.type === variants.key
    )
    variantsRef.innerText = variants.display_name
    priceRef.innerText = `¥ ${variants.price}`
    productImgRef.src = matchType
      ? matchType.file
      : "assets/img/mockup-img/product-image-placeholder.jpg"

    this.productFiltered = {
      ...product,
      uploads: matchType ?? null,
      variants: variants ?? null,
    }
  }
}
