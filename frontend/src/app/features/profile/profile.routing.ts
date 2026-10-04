import { Routes } from "@angular/router";

import { AccountComponent } from "./account/account.component";
import { ProfileComponent } from "./profile/profile.component";

export const ProfileRoutes: Routes = [
  { path: "account", component: AccountComponent },
  { path: "profile", component: ProfileComponent },
];
