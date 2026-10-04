import { Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-storage-fee',
  templateUrl: './storage-fee.component.html',
  styleUrls: ['./storage-fee.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'faq' }],
})
export class StorageFeeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
