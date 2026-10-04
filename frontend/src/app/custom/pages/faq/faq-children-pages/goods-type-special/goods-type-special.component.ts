import { Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-goods-type-special',
  templateUrl: './goods-type-special.component.html',
  styleUrls: ['./goods-type-special.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'faq' }],
})
export class GoodsTypeSpecialComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
