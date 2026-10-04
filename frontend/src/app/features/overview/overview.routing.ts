import { Routes } from "@angular/router";

import { WarehouseAddressComponent } from "./warehouse-address/warehouse-address.component";
import { InternationalShippingRateComponent } from "./international-shipping-rate/international-shipping-rate.component";
import { DomesticShippingRateComponent } from "./domestic-shipping-rate/domestic-shipping-rate.component";

export const OverviewRoutes: Routes = [
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
];
