import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../shared/shared.module";

import { RouterModule } from "@angular/router";
import { MapsRoutes } from "./maps.routing";

import { GoogleComponent } from "./google/google.component";
import { VectorComponent } from "./vector/vector.component";
import { DxVectorMapModule, DxPieChartModule } from 'devextreme-angular';

@NgModule({
  declarations: [GoogleComponent, VectorComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(MapsRoutes),
    SharedModule,
    DxVectorMapModule,
    DxPieChartModule
  ]
})
export class MapsModule {}
