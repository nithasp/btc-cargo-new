import { Routes } from "@angular/router";

import { OverviewManageAgentComponent } from "./overview-manage-agent/overview-manage-agent.component";
import { AgentComponent } from "./agent/agent.component";
import { ManageParcelComponent } from "./manage-parcel/manage-parcel.component";
import { GoalComponent } from "./goal/goal.component";

export const AffiliateRoutes: Routes = [
  {
    path: "overview-manage-agent",
    component: OverviewManageAgentComponent,
  },
  { path: "agent", component: AgentComponent },
  { path: "manage-parcel", component: ManageParcelComponent },
  { path: "goal", component: GoalComponent },
];
