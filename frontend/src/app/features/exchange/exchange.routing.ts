import { Routes } from "@angular/router";

import { CreateExchangeComponent } from "./create-exchange/create-exchange.component";
import { WalletsComponent } from "./wallets/wallets.component";

export const ExchangeRoutes: Routes = [
  { path: "create-exchange", component: CreateExchangeComponent },
  { path: "wallets", component: WalletsComponent },
];
