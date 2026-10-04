import { Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-order-detail-consignment',
  templateUrl: './order-detail-consignment.component.html',
  styleUrls: ['./order-detail-consignment.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'shop' }],
})
export class OrderDetailConsignmentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
