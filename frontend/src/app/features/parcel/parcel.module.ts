import { NgModule } from "@angular/core";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";

import { SharedFormsModule } from "src/app/shared/shared-forms.module";
import { CreateParcelComponent } from "./create-parcel/create-parcel.component";
import { ParcelListComponent } from "./parcel-list/parcel-list.component";
import { CreatedParcelListComponent } from "./created-parcel-list/created-parcel-list.component";
import { GoodsConfirmComponent } from "./goods-confirm/goods-confirm.component";

@NgModule({
  declarations: [
    CreateParcelComponent,
    ParcelListComponent,
    CreatedParcelListComponent,
    GoodsConfirmComponent,
  ],
  imports: [SharedFormsModule, BsDropdownModule, BsDatepickerModule],
})
export class ParcelModule {}
