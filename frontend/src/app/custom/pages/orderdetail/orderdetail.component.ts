import { Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-orderdetail',
  templateUrl: './orderdetail.component.html',
  styleUrls: ['./orderdetail.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'shop' }],
})
export class OrderdetailComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
