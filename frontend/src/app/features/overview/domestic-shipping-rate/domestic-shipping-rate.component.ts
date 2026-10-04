import { Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-domestic-shipping-rate',
  templateUrl: './domestic-shipping-rate.component.html',
  styleUrls: ['./domestic-shipping-rate.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'overview' }],
})
export class DomesticShippingRateComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
