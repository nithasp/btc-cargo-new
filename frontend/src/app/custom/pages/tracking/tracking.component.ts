import { Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'shop' }],
})
export class TrackingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
