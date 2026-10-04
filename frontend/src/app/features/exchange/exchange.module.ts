import { NgModule } from "@angular/core";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";

import { SharedFormsModule } from "src/app/shared/shared-forms.module";
import { AllExchangeComponent } from "./components/all-exchange/all-exchange.component";
import { CreateNewExchangeComponent } from "./components/create-new-exchange/create-new-exchange.component";
import { AlipayPaymentComponent } from "./components/alipay-payment/alipay-payment.component";
import { BankPaymentComponent } from "./components/bank-payment/bank-payment.component";
import { PaymentDetailsComponent } from "./components/payment-details/payment-details.component";
import { PaymentSummaryComponent } from "./components/payment-summary/payment-summary.component";
import { CreateExchangeComponent } from "./create-exchange/create-exchange.component";
import { WalletsComponent } from "./wallets/wallets.component";

@NgModule({
  declarations: [
    AllExchangeComponent,
    CreateNewExchangeComponent,
    AlipayPaymentComponent,
    BankPaymentComponent,
    PaymentDetailsComponent,
    PaymentSummaryComponent,
    CreateExchangeComponent,
    WalletsComponent,
  ],
  imports: [SharedFormsModule, BsDropdownModule],
})
export class ExchangeModule {}
