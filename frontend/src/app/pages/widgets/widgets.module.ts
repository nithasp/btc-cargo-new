import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { SharedModule } from "../../shared/shared.module";

import { WidgetsComponent } from "./widgets.component";

import { RouterModule } from "@angular/router";
import { WidgetsRoutes } from "./widgets.routing";

@NgModule({
  declarations: [WidgetsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(WidgetsRoutes),
    ProgressbarModule.forRoot(),
    SharedModule
  ]
})
export class WidgetsModule {}
