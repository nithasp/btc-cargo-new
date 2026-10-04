import { Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-pending-payment-list',
  templateUrl: './pending-payment-list.component.html',
  styleUrls: ['./pending-payment-list.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'shop' }],
})
export class PendingPaymentListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
