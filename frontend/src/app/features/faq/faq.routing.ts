import { Routes } from "@angular/router";

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

export const FaqRoutes: Routes = [
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
];
