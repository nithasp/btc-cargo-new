import { NgModule } from "@angular/core";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";

import { SharedFormsModule } from "src/app/shared/shared-forms.module";
import { OverlayLoadingComponent } from "./components/overlay-loading/overlay-loading.component";
import { PurchaseComponent } from "./purchase/purchase.component";
import { CartComponent } from "./cart/cart.component";
import { CheckoutComponent } from "./checkout/checkout.component";
import { OrderdetailComponent } from "./orderdetail/orderdetail.component";
import { TrackingComponent } from "./tracking/tracking.component";
import { TrackingDetailsComponent } from "./tracking-details/tracking-details.component";
import { TrackingDetailsMobileComponent } from "./tracking-details/components/tracking-details-mobile/tracking-details-mobile.component";
import { FindProductComponent } from "./find-product/find-product.component";
import { PendingPaymentListComponent } from "./pending-payment-list/pending-payment-list.component";
import { OrderDetailConsignmentComponent } from "./order-detail-consignment/order-detail-consignment.component";
import { TrackingConsignmentComponent } from "./tracking-consignment/tracking-consignment.component";
import { MockupCartDataPageComponent } from "./mockup-cart-data-page/mockup-cart-data-page.component";

@NgModule({
  declarations: [
    OverlayLoadingComponent,
    PurchaseComponent,
    CartComponent,
    CheckoutComponent,
    OrderdetailComponent,
    TrackingComponent,
    TrackingDetailsComponent,
    TrackingDetailsMobileComponent,
    FindProductComponent,
    PendingPaymentListComponent,
    OrderDetailConsignmentComponent,
    TrackingConsignmentComponent,
    MockupCartDataPageComponent,
  ],
  imports: [SharedFormsModule, BsDropdownModule],
})
export class ShopModule {}
