import { Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: ['faq', 'overview'] }],
})
export class DeliveryComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
