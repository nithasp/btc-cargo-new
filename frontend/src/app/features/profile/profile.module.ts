import { NgModule } from "@angular/core";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";

import { SharedFormsModule } from "src/app/shared/shared-forms.module";
import { AccountComponent } from "./account/account.component";
import { ProfileComponent } from "./profile/profile.component";

@NgModule({
  declarations: [AccountComponent, ProfileComponent],
  imports: [SharedFormsModule, BsDatepickerModule],
})
export class ProfileModule {}
