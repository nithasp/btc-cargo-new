import { Component, OnInit, HostListener } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import {
  AuthService,
  getAccessToken,
  btcBaseUrl,
  getHttpHeadersValue,
} from "src/app/custom/services";
import { UserInfo } from "src/app/custom/interfaces";

@Component({
  selector: "app-admin-layout",
  templateUrl: "./admin-layout.component.html",
  styleUrls: ["./admin-layout.component.scss"],
})
export class AdminLayoutComponent implements OnInit {
  isMobileResolution: boolean;
  hasUserAdmin: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {
    if (window.innerWidth < 1200) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
  }
  @HostListener("window:resize", ["$event"])
  isMobile(event) {
    if (window.innerWidth < 1200) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
  }

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    if (getAccessToken()) {
      this.http
        .get<UserInfo>(`${btcBaseUrl}/api/user/`, {
          headers: getHttpHeadersValue(),
        })
        .subscribe(
          (res) => {
            this.hasUserAdmin = true;
            this.authService.userInfo.next(res);
            this.authService.userId.next(res.id);
            console.log(res);
          },
          (err) => {
            console.log(err, err.error.detail);
            this.hasUserAdmin = false;
            this.router.navigate([""]);
          }
        );
    } else {
      this.hasUserAdmin = false;
      this.router.navigate([""]);
    }
  }
}
