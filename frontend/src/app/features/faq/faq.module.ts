import { NgModule } from "@angular/core";

import { SharedModule } from "src/app/shared/shared.module";
import { FaqComponent } from "./faq.component";
import { ConditionsComponent } from "./conditions/conditions.component";
import { HowToCalculateComponent } from "./how-to-calculate/how-to-calculate.component";
import { StorageFeeComponent } from "./storage-fee/storage-fee.component";
import { InvoiceComponent } from "./invoice/invoice.component";
import { DeliveryComponent } from "./delivery/delivery.component";
import { StatusComponent } from "./status/status.component";
import { GoodsTypeComponent } from "./goods-type/goods-type.component";
import { GoodsTypeSpecialComponent } from "./goods-type-special/goods-type-special.component";
import { PalletComponent } from "./pallet/pallet.component";
import { ExchangeComponent } from "./exchange/exchange.component";

@NgModule({
  declarations: [
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
  ],
  imports: [SharedModule],
})
export class FaqModule {}
