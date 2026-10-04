import { Routes } from "@angular/router";

import { PaymentNoticeComponent } from "./payment-notice/payment-notice.component";
import { TransportPaymentComponent } from "./transport-payment/transport-payment.component";
import { TransportPaymentDetailComponent } from "./transport-payment-detail/transport-payment-detail.component";
import { CreateBillComponent } from "./create-bill/create-bill.component";
import { BillsComponent } from "./bills/bills.component";
import { BillDetailComponent } from "./bill-detail/bill-detail.component";

export const PaymentRoutes: Routes = [
  { path: "payment-notice/:bill-id", component: PaymentNoticeComponent },
  // Pending transport-payment
  { path: "transport-payment", component: TransportPaymentComponent },
  {
    path: "transport-payment/:transport-payment-number",
    component: TransportPaymentDetailComponent,
  },
  { path: "create-bill", component: CreateBillComponent },
  { path: "bills", component: BillsComponent },
  { path: "bills/:bill-number", component: BillDetailComponent },
];
