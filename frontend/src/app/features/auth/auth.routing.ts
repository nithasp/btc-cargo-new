import { Routes } from "@angular/router";

import { GuestGuard } from "src/app/core/guards/guest.guard";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { TermsAndConditionsComponent } from "./terms-and-conditions/terms-and-conditions.component";
import { PdpaConditionsComponent } from "./pdpa-conditions/pdpa-conditions.component";

export const AuthRoutes: Routes = [
  { path: "login", component: LoginComponent, canActivate: [GuestGuard] },
  {
    path: "register",
    component: RegisterComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "terms-and-conditions",
    component: TermsAndConditionsComponent,
  },
  {
    path: "pdpa-conditions",
    component: PdpaConditionsComponent,
  },
];
