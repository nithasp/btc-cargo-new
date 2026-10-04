import { Routes } from "@angular/router";

import { CreateParcelComponent } from "./create-parcel/create-parcel.component";
import { ParcelListComponent } from "./parcel-list/parcel-list.component";
import { CreatedParcelListComponent } from "./created-parcel-list/created-parcel-list.component";
import { GoodsConfirmComponent } from "./goods-confirm/goods-confirm.component";

export const ParcelRoutes: Routes = [
  { path: "create-parcel", component: CreateParcelComponent },
  { path: "parcel-list", component: ParcelListComponent },
  { path: "created-parcel-list", component: CreatedParcelListComponent },
  { path: "goods-confirm", component: GoodsConfirmComponent },
];
