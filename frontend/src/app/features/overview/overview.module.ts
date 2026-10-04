import { NgModule } from "@angular/core";

import { SharedModule } from "src/app/shared/shared.module";
import { WarehouseAddressComponent } from "./warehouse-address/warehouse-address.component";
import { InternationalShippingRateComponent } from "./international-shipping-rate/international-shipping-rate.component";
import { DomesticShippingRateComponent } from "./domestic-shipping-rate/domestic-shipping-rate.component";

@NgModule({
  declarations: [
    WarehouseAddressComponent,
    InternationalShippingRateComponent,
    DomesticShippingRateComponent,
  ],
  imports: [SharedModule],
})
export class OverviewModule {}
