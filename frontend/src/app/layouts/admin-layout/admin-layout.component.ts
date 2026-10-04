import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/shared/services/auth.service";
import {
  getAccessToken,
  btcBaseUrl,
  getHttpHeadersValue,
} from "src/app/core/config/api-config";
import { UserInfo } from "src/app/shared/models/user-information.model";

@Component({
  selector: "app-admin-layout",
  templateUrl: "./admin-layout.component.html",
  styleUrls: ["./admin-layout.component.scss"],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  isMobileResolution: boolean;
  hasUserAdmin: boolean = false;
  sessionReady: Subscription;

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
    this.sessionReady = this.authService
      .getSessionReady()
      .subscribe(() => this.getUser());
  }

  ngOnDestroy() {
    this.sessionReady.unsubscribe();
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
