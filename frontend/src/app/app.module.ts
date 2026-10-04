import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
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

import { environment } from "../environments/environment";
import { TranslocoRootModule } from "src/transloco/transloco-root.module";
import { AppComponent } from "./app.component";
import { AuthInterceptor } from "./core/interceptors/auth.interceptor";
import { PresentationModule } from "./pages/presentation/presentation.module";
import { BrowserModule } from "@angular/platform-browser";
import { SharedModule } from "./shared/shared.module";
import { AppRoutingModule } from "./app-routing.module";
import { LayoutsModule } from "./layouts/layouts.module";
import { AuthModule } from "./features/auth/auth.module";
import { OverviewModule } from "./features/overview/overview.module";
import { ParcelModule } from "./features/parcel/parcel.module";
import { PaymentModule } from "./features/payment/payment.module";
import { ExchangeModule } from "./features/exchange/exchange.module";
import { ShopModule } from "./features/shop/shop.module";
import { AffiliateModule } from "./features/affiliate/affiliate.module";
import { ProfileModule } from "./features/profile/profile.module";
import { FaqModule } from "./features/faq/faq.module";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
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
    TranslocoRootModule,
    LayoutsModule,
    AuthModule,
    OverviewModule,
    ParcelModule,
    PaymentModule,
    ExchangeModule,
    ShopModule,
    AffiliateModule,
    ProfileModule,
    FaqModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    // Angular Social-x-login provider
    {
      provide: "SocialAuthServiceConfig",
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.googleClientId),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(environment.facebookAppId),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
