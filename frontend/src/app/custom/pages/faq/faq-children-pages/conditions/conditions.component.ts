import { Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'faq' }],
})
export class ConditionsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
