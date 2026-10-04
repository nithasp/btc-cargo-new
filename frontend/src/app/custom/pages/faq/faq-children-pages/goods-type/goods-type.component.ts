import { Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-goods-type',
  templateUrl: './goods-type.component.html',
  styleUrls: ['./goods-type.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'faq' }],
})
export class GoodsTypeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
