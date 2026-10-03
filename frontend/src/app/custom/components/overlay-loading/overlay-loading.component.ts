import { Component, OnInit } from "@angular/core";
import { CartService } from "../../services/cart.service";

@Component({
  selector: "app-overlay-loading",
  templateUrl: "./overlay-loading.component.html",
  styleUrls: ["./overlay-loading.component.scss"],
})
export class OverlayLoadingComponent implements OnInit {
  isLoadingIconDisplay: boolean = false;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.subscribeGlobalVariables();
  }

  subscribeGlobalVariables() {
    this.cartService
      .getBackendCartUpdate()
      .subscribe((value) => (this.isLoadingIconDisplay = value));
  }
}
