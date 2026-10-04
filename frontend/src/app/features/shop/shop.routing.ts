import { Routes } from "@angular/router";

import { PurchaseComponent } from "./purchase/purchase.component";
import { CartComponent } from "./cart/cart.component";
import { CheckoutComponent } from "./checkout/checkout.component";
import { OrderdetailComponent } from "./orderdetail/orderdetail.component";
import { TrackingComponent } from "./tracking/tracking.component";
import { TrackingDetailsComponent } from "./tracking-details/tracking-details.component";
import { FindProductComponent } from "./find-product/find-product.component";
import { PendingPaymentListComponent } from "./pending-payment-list/pending-payment-list.component";
import { OrderDetailConsignmentComponent } from "./order-detail-consignment/order-detail-consignment.component";
import { TrackingConsignmentComponent } from "./tracking-consignment/tracking-consignment.component";
import { MockupCartDataPageComponent } from "./mockup-cart-data-page/mockup-cart-data-page.component";

export const ShopRoutes: Routes = [
  { path: "purchase", component: PurchaseComponent },
  { path: "cart", component: CartComponent },
  { path: "checkout", component: CheckoutComponent },
  { path: "orderdetail", component: OrderdetailComponent },
  { path: "tracking", component: TrackingComponent },
  { path: "tracking-details", component: TrackingDetailsComponent },
  { path: "find-product", component: FindProductComponent },
  { path: "pending-payment-list", component: PendingPaymentListComponent },
  {
    path: "order-detail-consignment",
    component: OrderDetailConsignmentComponent,
  },
  {
    path: "tracking-consignment",
    component: TrackingConsignmentComponent,
  },
  // Mockup data for test
  { path: "mockup-data", component: MockupCartDataPageComponent },
];
