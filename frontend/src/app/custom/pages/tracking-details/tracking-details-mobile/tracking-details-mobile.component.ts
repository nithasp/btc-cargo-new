import { Component, OnInit } from "@angular/core"
import { TRANSLOCO_SCOPE } from "@ngneat/transloco"

@Component({
  selector: "app-tracking-details-mobile",
  templateUrl: "./tracking-details-mobile.component.html",
  styleUrls: ["./tracking-details-mobile.component.scss"],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: "shop" }],
})
export class TrackingDetailsMobileComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
