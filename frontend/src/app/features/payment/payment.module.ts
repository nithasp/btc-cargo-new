import { NgModule } from "@angular/core";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { TimepickerModule } from "ngx-bootstrap/timepicker";
import { NgxDropzoneModule } from "ngx-dropzone";

import { SharedFormsModule } from "src/app/shared/shared-forms.module";
import { PaymentNoticeComponent } from "./payment-notice/payment-notice.component";
import { TransportPaymentComponent } from "./transport-payment/transport-payment.component";
import { TransportPaymentDetailComponent } from "./transport-payment-detail/transport-payment-detail.component";
import { CreateBillComponent } from "./create-bill/create-bill.component";
import { BillsComponent } from "./bills/bills.component";
import { BillDetailComponent } from "./bill-detail/bill-detail.component";

@NgModule({
  declarations: [
    PaymentNoticeComponent,
    TransportPaymentComponent,
    TransportPaymentDetailComponent,
    CreateBillComponent,
    BillsComponent,
    BillDetailComponent,
  ],
  imports: [
    SharedFormsModule,
    BsDatepickerModule,
    TimepickerModule,
    NgxDropzoneModule,
  ],
})
export class PaymentModule {}
