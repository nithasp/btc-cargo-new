import { NgModule } from "@angular/core";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";

import { SharedFormsModule } from "src/app/shared/shared-forms.module";
import { DialogAffiliateComponent } from "./components/dialogs/dialog-affiliate/dialog-affiliate.component";
import { OverviewManageAgentComponent } from "./overview-manage-agent/overview-manage-agent.component";
import { AgentComponent } from "./agent/agent.component";
import { ManageParcelComponent } from "./manage-parcel/manage-parcel.component";
import { GoalComponent } from "./goal/goal.component";

@NgModule({
  declarations: [
    DialogAffiliateComponent,
    OverviewManageAgentComponent,
    AgentComponent,
    ManageParcelComponent,
    GoalComponent,
  ],
  imports: [SharedFormsModule, BsDatepickerModule],
})
export class AffiliateModule {}
