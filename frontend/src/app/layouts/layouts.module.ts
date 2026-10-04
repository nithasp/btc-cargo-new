import { NgModule } from "@angular/core";
import { CollapseModule } from "ngx-bootstrap/collapse";

import { SharedModule } from "src/app/shared/shared.module";
import { AdminLayoutComponent } from "./admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./auth-layout/auth-layout.component";

@NgModule({
  declarations: [AdminLayoutComponent, AuthLayoutComponent],
  imports: [SharedModule, CollapseModule],
  exports: [AdminLayoutComponent, AuthLayoutComponent],
})
export class LayoutsModule {}
