import { Component, OnInit, HostListener } from "@angular/core"

@Component({
  selector: "app-tracking-details",
  templateUrl: "./tracking-details.component.html",
  styleUrls: ["./tracking-details.component.scss"],
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
