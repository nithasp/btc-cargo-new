import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ToastrModule } from "ngx-toastr";
import { TagInputModule } from "ngx-chips";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { TimepickerModule } from "ngx-bootstrap/timepicker";
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider,
} from "angularx-social-login";
import { RecaptchaModule, RecaptchaFormsModule } from "ng-recaptcha";
import { ZXingScannerModule } from "@zxing/ngx-scanner";
import { NgxDropzoneModule } from "ngx-dropzone";
import { InfiniteScrollModule } from "ngx-infinite-scroll";

import { AppComponent } from "./app.component";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";
import { PresentationModule } from "./pages/presentation/presentation.module";
import { BrowserModule } from "@angular/platform-browser";
import { ComponentsModule } from "./components/components.module";
import { AppRoutingModule } from "./app-routing.module";
import { LineLoginComponent } from "./custom/components/social-login/line-login/line-login.component";
import { GoogleLoginComponent } from "./custom/components/social-login/google-login/google-login.component";
import { FacebookLoginComponent } from "./custom/components/social-login/facebook-login/facebook-login.component";
import { PurchaseComponent } from "./custom/pages/purchase/purchase.component";
import { CartComponent } from "./custom/pages/cart/cart.component";
import { OrderdetailComponent } from "./custom/pages/orderdetail/orderdetail.component";
import { TrackingComponent } from "./custom/pages/tracking/tracking.component";
import { TrackingDetailsComponent } from "./custom/pages/tracking-details/tracking-details.component";
import { TrackingDetailsMobileComponent } from "./custom/pages/tracking-details/tracking-details-mobile/tracking-details-mobile.component";
import { LoginComponent } from "./custom/pages/login/login.component";
import { HomeComponent } from "./custom/pages/home/home.component";
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
import { TermsAndConditionsComponent } from "./custom/pages/terms-and-conditions/terms-and-conditions/terms-and-conditions.component";
import { PdpaConditionsComponent } from "./custom/pages/terms-and-conditions/pdpa-conditions/pdpa-conditions.component";
import { MockupCartDataPageComponent } from "./custom/pages/cart/mockup-cart-data-page/mockup-cart-data-page.component";
import { SelectAddressComponent } from "./custom/components/select-address/select-address.component";
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
import { AddressPipe } from "./pipe/address.pipe";
import { OverlayLoadingComponent } from "./custom/components/overlay-loading/overlay-loading.component";
import { QrScannerComponent } from "./custom/components/qr-scanner/qr-scanner.component";
import { OrderDetailConsignmentComponent } from "./custom/pages/order-detail-consignment/order-detail-consignment.component";
import { TrackingConsignmentComponent } from "./custom/pages/tracking-consignment/tracking-consignment.component";
import { TransportPaymentDetailComponent } from "./custom/pages/transport-payment/transport-payment-detail/transport-payment-detail.component";
import { AllExchangeComponent } from "./custom/components/exchange-money/all-exchange/all-exchange.component";
import { CreateNewExchangeComponent } from "./custom/components/exchange-money/create-new-exchange/create-new-exchange.component";
import { AlipayPaymentComponent } from "./custom/components/exchange-money/alipay-payment/alipay-payment.component";
import { BankPaymentComponent } from "./custom/components/exchange-money/bank-payment/bank-payment.component";
import { PaymentDetailsComponent } from "./custom/components/exchange-money/payment-details/payment-details.component";
import { PaymentSummaryComponent } from "./custom/components/exchange-money/payment-summary/payment-summary.component";
import { CreatedParcelListComponent } from "./custom/pages/parcel-delivery/created-parcel-list/created-parcel-list.component";
import { WalletsComponent } from './custom/pages/wallets/wallets.component';
// Affiliate
import { OverviewManageAgentComponent } from "./custom/pages/affiliate/overview-manage-agent/overview-manage-agent.component";
import { AgentComponent } from "./custom/pages/affiliate/agent/agent.component";
import { ManageParcelComponent } from "./custom/pages/affiliate/manage-parcel/manage-parcel.component";
import { GoalComponent } from "./custom/pages/affiliate/goal/goal.component";
import { AffiliateModalComponent } from "./custom/pages/affiliate/affiliate-modal/affiliate-modal.component";


@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    LineLoginComponent,
    GoogleLoginComponent,
    FacebookLoginComponent,
    PurchaseComponent,
    CartComponent,
    OrderdetailComponent,
    TrackingComponent,
    TrackingDetailsComponent,
    TrackingDetailsMobileComponent,
    LoginComponent,
    HomeComponent,
    RegisterComponent,
    CheckoutComponent,
    AccountComponent,
    FaqComponent,
    ConditionsComponent,
    HowToCalculateComponent,
    StorageFeeComponent,
    InvoiceComponent,
    DeliveryComponent,
    StatusComponent,
    GoodsTypeComponent,
    GoodsTypeSpecialComponent,
    PalletComponent,
    ExchangeComponent,
    ProfileComponent,
    WarehouseAddressComponent,
    TermsAndConditionsComponent,
    PdpaConditionsComponent,
    MockupCartDataPageComponent,
    SelectAddressComponent,
    CreateParcelComponent,
    ParcelListComponent,
    CreatedParcelListComponent,
    GoodsConfirmComponent,
    TransportPaymentComponent,
    CreateBillComponent,
    BillsComponent,
    BillDetailComponent,
    FindProductComponent,
    CreateExchangeComponent,
    PendingPaymentListComponent,
    PaymentNoticeComponent,
    NgxScannerComponent,
    OverlayLoadingComponent,
    // Pipe
    AddressPipe,
    QrScannerComponent,
    OrderDetailConsignmentComponent,
    TrackingConsignmentComponent,
    OverviewManageAgentComponent,
    AgentComponent,
    ManageParcelComponent,
    GoalComponent,
    TransportPaymentDetailComponent,
    AllExchangeComponent,
    CreateNewExchangeComponent,
    AlipayPaymentComponent,
    BankPaymentComponent,
    PaymentDetailsComponent,
    PaymentSummaryComponent,
    WalletsComponent,
    AffiliateModalComponent
  ],
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    ComponentsModule,
    BsDropdownModule.forRoot(),
    AppRoutingModule,
    ToastrModule.forRoot(),
    CollapseModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    TagInputModule,
    PresentationModule,
    BrowserModule,
    AppRoutingModule,
    SocialLoginModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    ZXingScannerModule,
    NgxDropzoneModule,
    InfiniteScrollModule,
  ],
  providers: [
    // Angular Social-x-login provider
    {
      provide: "SocialAuthServiceConfig",
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              "246196017998-q52ius7kkuf4g917g4qjgusbl9ga0f4e.apps.googleusercontent.com"
            ),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider("1050061045557139"),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
