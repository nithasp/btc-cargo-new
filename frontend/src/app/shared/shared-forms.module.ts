import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { SharedModule } from "./shared.module";

@NgModule({
  exports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule],
})
export class SharedFormsModule {}
