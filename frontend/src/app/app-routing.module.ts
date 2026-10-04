import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";

import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { SessionGuard } from "./core/guards/session.guard";
import { NgxScannerComponent } from "./shared/components/ngx-scanner/ngx-scanner.component";
import { QrScannerComponent } from "./shared/components/qr-scanner/qr-scanner.component";
import { AuthRoutes } from "./features/auth/auth.routing";
import { OverviewRoutes } from "./features/overview/overview.routing";
import { ParcelRoutes } from "./features/parcel/parcel.routing";
import { PaymentRoutes } from "./features/payment/payment.routing";
import { ExchangeRoutes } from "./features/exchange/exchange.routing";
import { ShopRoutes } from "./features/shop/shop.routing";
import { AffiliateRoutes } from "./features/affiliate/affiliate.routing";
import { ProfileRoutes } from "./features/profile/profile.routing";
import { FaqRoutes } from "./features/faq/faq.routing";

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  ...AuthRoutes,
  {
    path: "web",
    component: AdminLayoutComponent,
    canActivate: [SessionGuard],
    children: [
      ...OverviewRoutes,
      ...ParcelRoutes,
      ...PaymentRoutes,
      ...ExchangeRoutes,
      ...ShopRoutes,
      ...AffiliateRoutes,
      ...ProfileRoutes,
      { path: "ngx-scanner", component: NgxScannerComponent },
      { path: "qr-scanner", component: QrScannerComponent },
      // Page not Found
      { path: "", redirectTo: "profile", pathMatch: "full" },
    ],
  },
  ...FaqRoutes,
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
