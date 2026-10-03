import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";

import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { PurchaseComponent } from "./custom/pages/purchase/purchase.component";
import { CartComponent } from "./custom/pages/cart/cart.component";
import { OrderdetailComponent } from "./custom/pages/orderdetail/orderdetail.component";
import { TrackingComponent } from "./custom/pages/tracking/tracking.component";
import { TrackingDetailsComponent } from "./custom/pages/tracking-details/tracking-details.component";
import { LoginComponent } from "./custom/pages/login/login.component";
import { RegisterComponent } from "./custom/pages/register/register.component";
import { CheckoutComponent } from "./custom/pages/checkout/checkout.component";
import { AccountComponent } from "./custom/pages/account/account.component";
import { FaqComponent } from "./custom/pages/faq/faq.component";
import { ConditionsComponent } from "./custom/pages/faq/faq-children-pages/conditions/conditions.component";
import { HowToCalculateComponent } from "./custom/pages/faq/faq-children-pages/how-to-calculate/how-to-calculate.component";
import { StorageFeeComponent } from "./custom/pages/faq/faq-children-pages/storage-fee/storage-fee.component";
import { InvoiceComponent } from "./custom/pages/faq/faq-children-pages/invoice/invoice.component";
import { DeliveryComponent } from "./custom/pages/faq/faq-children-pages/delivery/delivery.component";
import { StatusComponent } from "./custom/pages/faq/faq-children-pages/status/status.component";
import { GoodsTypeComponent } from "./custom/pages/faq/faq-children-pages/goods-type/goods-type.component";
import { GoodsTypeSpecialComponent } from "./custom/pages/faq/faq-children-pages/goods-type-special/goods-type-special.component";
import { PalletComponent } from "./custom/pages/faq/faq-children-pages/pallet/pallet.component";
import { ExchangeComponent } from "./custom/pages/faq/faq-children-pages/exchange/exchange.component";
import { ProfileComponent } from "./custom/pages/profile/profile.component";
import { WarehouseAddressComponent } from "./custom/pages/overview/warehouse-address/warehouse-address.component";
import { InternationalShippingRateComponent } from "./custom/pages/overview/international-shipping-rate/international-shipping-rate.component";
import { DomesticShippingRateComponent } from "./custom/pages/overview/domestic-shipping-rate/domestic-shipping-rate.component";
import { TermsAndConditionsComponent } from "./custom/pages/terms-and-conditions/terms-and-conditions/terms-and-conditions.component";
import { PdpaConditionsComponent } from "./custom/pages/terms-and-conditions/pdpa-conditions/pdpa-conditions.component";
import { MockupCartDataPageComponent } from "./custom/pages/cart/mockup-cart-data-page/mockup-cart-data-page.component";
import { CreateParcelComponent } from "./custom/pages/parcel-delivery/create-parcel/create-parcel.component";
import { ParcelListComponent } from "./custom/pages/parcel-delivery/parcel-list/parcel-list.component";
import { GoodsConfirmComponent } from "./custom/pages/goods-confirm/goods-confirm.component";
import { TransportPaymentComponent } from "./custom/pages/transport-payment/transport-payment.component";
import { CreateBillComponent } from "./custom/pages/transport-payment/create-bill/create-bill.component";
import { BillsComponent } from "./custom/pages/transport-payment/bills/bills.component";
import { BillDetailComponent } from "./custom/pages/transport-payment/bill-detail/bill-detail.component";
import { FindProductComponent } from "./custom/pages/find-product/find-product.component";
import { CreateExchangeComponent } from "./custom/pages/exchange-money/create-exchange/create-exchange.component";
import { PendingPaymentListComponent } from "./custom/pages/pending-payment-list/pending-payment-list.component";
import { PaymentNoticeComponent } from "./custom/pages/payment-notice/payment-notice.component";
import { NgxScannerComponent } from "./custom/components/ngx-scanner/ngx-scanner.component";
import { QrScannerComponent } from "./custom/components/qr-scanner/qr-scanner.component";
import { OrderDetailConsignmentComponent } from "./custom/pages/order-detail-consignment/order-detail-consignment.component";
import { TrackingConsignmentComponent } from "./custom/pages/tracking-consignment/tracking-consignment.component";
import { TransportPaymentDetailComponent } from "./custom/pages/transport-payment/transport-payment-detail/transport-payment-detail.component";
import { CreatedParcelListComponent } from "./custom/pages/parcel-delivery/created-parcel-list/created-parcel-list.component";
import { WalletsComponent } from "./custom/pages/wallets/wallets.component";
// Affiliate
import { OverviewManageAgentComponent } from "./custom/pages/affiliate/overview-manage-agent/overview-manage-agent.component";
import { AgentComponent } from "./custom/pages/affiliate/agent/agent.component";
import { ManageParcelComponent } from "./custom/pages/affiliate/manage-parcel/manage-parcel.component";
import { GoalComponent } from "./custom/pages/affiliate/goal/goal.component";

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  {
    path: "web",
    component: AdminLayoutComponent,
    children: [
      { path: "warehouse-address", component: WarehouseAddressComponent },
      {
        path: "international-shipping-rate",
        component: InternationalShippingRateComponent,
      },
      {
        path: "domestic-shipping-rate",
        component: DomesticShippingRateComponent,
      },
      {
        path: "international-shipping-rate",
        component: WarehouseAddressComponent,
      },
      { path: "domestic-shipping-rate", component: WarehouseAddressComponent },
      { path: "account", component: AccountComponent },
      { path: "purchase", component: PurchaseComponent },
      { path: "cart", component: CartComponent },
      { path: "checkout", component: CheckoutComponent },
      { path: "orderdetail", component: OrderdetailComponent },
      { path: "tracking", component: TrackingComponent },
      { path: "tracking-details", component: TrackingDetailsComponent },
      { path: "profile", component: ProfileComponent },
      { path: "create-parcel", component: CreateParcelComponent },
      { path: "parcel-list", component: ParcelListComponent },
      { path: "created-parcel-list", component: CreatedParcelListComponent },
      { path: "goods-confirm", component: GoodsConfirmComponent },
      { path: "find-product", component: FindProductComponent },
      { path: "create-exchange", component: CreateExchangeComponent },
      { path: "pending-payment-list", component: PendingPaymentListComponent },
      { path: "payment-notice/:bill-id", component: PaymentNoticeComponent },
      {
        path: "order-detail-consignment",
        component: OrderDetailConsignmentComponent,
      },
      {
        path: "tracking-consignment",
        component: TrackingConsignmentComponent,
      },
      {
        path: "overview-manage-agent",
        component: OverviewManageAgentComponent,
      },
      { path: "agent", component: AgentComponent },
      { path: "manage-parcel", component: ManageParcelComponent },
      { path: "goal", component: GoalComponent },
      // Pending transport-payment
      { path: "transport-payment", component: TransportPaymentComponent },
      {
        path: "transport-payment/:transport-payment-number",
        component: TransportPaymentDetailComponent,
      },
      { path: "create-bill", component: CreateBillComponent },
      { path: "bills", component: BillsComponent },
      { path: "bills/:bill-number", component: BillDetailComponent },
      { path: "wallets", component: WalletsComponent 
    },
      // Mockup data for test
      { path: "mockup-data", component: MockupCartDataPageComponent },
      { path: "ngx-scanner", component: NgxScannerComponent },
      { path: "qr-scanner", component: QrScannerComponent },
      // Page not Found
      { path: "", redirectTo: "profile", pathMatch: "full" },
    ],
  },
  {
    path: "faq",
    component: FaqComponent,
    children: [
      { path: "conditions", component: ConditionsComponent },
      { path: "how-to-calculate", component: HowToCalculateComponent },
      { path: "storage-fee", component: StorageFeeComponent },
      { path: "invoice", component: InvoiceComponent },
      { path: "delivery", component: DeliveryComponent },
      { path: "status", component: StatusComponent },
      { path: "goods-type", component: GoodsTypeComponent },
      { path: "goods-type-special", component: GoodsTypeSpecialComponent },
      { path: "pallet", component: PalletComponent },
      { path: "exchange", component: ExchangeComponent },
      { path: "", redirectTo: "conditions", pathMatch: "full" },
    ],
  },
  {
    path: "terms-and-conditions",
    component: TermsAndConditionsComponent,
  },
  {
    path: "pdpa-conditions",
    component: PdpaConditionsComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      //useHash: true
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
