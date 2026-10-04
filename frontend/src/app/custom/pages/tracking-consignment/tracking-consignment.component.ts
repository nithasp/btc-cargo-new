import { Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-tracking-consignment',
  templateUrl: './tracking-consignment.component.html',
  styleUrls: ['./tracking-consignment.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'shop' }],
})
export class TrackingConsignmentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
