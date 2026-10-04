import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { InfiniteScrollModule } from "ngx-infinite-scroll";

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { FooterComponent } from "./components/footer/footer.component";
import { VectorMapComponent1 } from "./components/vector-map/vector-map.component";
import { LanguageSwitchComponent } from "./components/language-switch/language-switch.component";
import { SelectAddressComponent } from "./components/select-address/select-address.component";
import { NgxScannerComponent } from "./components/ngx-scanner/ngx-scanner.component";
import { QrScannerComponent } from "./components/qr-scanner/qr-scanner.component";
import { AddressPipe } from "./pipes/address.pipe";

import { RouterModule } from "@angular/router";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { DxVectorMapModule, DxPieChartModule } from 'devextreme-angular';
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TranslocoModule } from "@ngneat/transloco";
import { ZXingScannerModule } from "@zxing/ngx-scanner";
import { NgxDropzoneModule } from "ngx-dropzone";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    CollapseModule.forRoot(),
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    DxVectorMapModule,
    DxPieChartModule,
    InfiniteScrollModule,
    TranslocoModule,
    ZXingScannerModule,
    NgxDropzoneModule,
  ],
  declarations: [
    FooterComponent,
    VectorMapComponent1,
    NavbarComponent,
    SidebarComponent,
    LanguageSwitchComponent,
    SelectAddressComponent,
    NgxScannerComponent,
    QrScannerComponent,
    AddressPipe,
  ],
  exports: [
    CommonModule,
    RouterModule,
    TranslocoModule,
    FooterComponent,
    VectorMapComponent1,
    NavbarComponent,
    SidebarComponent,
    LanguageSwitchComponent,
    SelectAddressComponent,
    NgxScannerComponent,
    QrScannerComponent,
    AddressPipe,
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
})
export class SharedModule {}
