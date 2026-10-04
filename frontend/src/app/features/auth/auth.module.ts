import { NgModule } from "@angular/core";

import { SharedFormsModule } from "src/app/shared/shared-forms.module";
import { LayoutsModule } from "src/app/layouts/layouts.module";
import { LineLoginComponent } from "./components/social-login/line-login/line-login.component";
import { GoogleLoginComponent } from "./components/social-login/google-login/google-login.component";
import { FacebookLoginComponent } from "./components/social-login/facebook-login/facebook-login.component";
import { LoginComponent } from "./login/login.component";
import { HomeComponent } from "./home/home.component";
import { RegisterComponent } from "./register/register.component";
import { TermsAndConditionsComponent } from "./terms-and-conditions/terms-and-conditions.component";
import { PdpaConditionsComponent } from "./pdpa-conditions/pdpa-conditions.component";

@NgModule({
  declarations: [
    LineLoginComponent,
    GoogleLoginComponent,
    FacebookLoginComponent,
    LoginComponent,
    HomeComponent,
    RegisterComponent,
    TermsAndConditionsComponent,
    PdpaConditionsComponent,
  ],
  imports: [SharedFormsModule, LayoutsModule],
})
export class AuthModule {}
