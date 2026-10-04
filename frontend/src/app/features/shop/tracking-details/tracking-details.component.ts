import { Component, OnInit, HostListener } from "@angular/core"
import { TRANSLOCO_SCOPE } from "@ngneat/transloco"

@Component({
  selector: "app-tracking-details",
  templateUrl: "./tracking-details.component.html",
  styleUrls: ["./tracking-details.component.scss"],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: "shop" }],
})
export class TrackingDetailsComponent implements OnInit {
  isDesktop: boolean
  constructor() {}

  ngOnInit(): void {
    this.isDesktop = window.innerWidth >= 900
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.isDesktop = window.innerWidth >= 900
  }
}
