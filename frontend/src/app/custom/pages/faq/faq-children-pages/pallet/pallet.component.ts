import { Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-pallet',
  templateUrl: './pallet.component.html',
  styleUrls: ['./pallet.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'faq' }],
})
export class PalletComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
