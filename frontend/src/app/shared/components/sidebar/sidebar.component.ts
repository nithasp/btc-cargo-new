import { Component, OnInit } from "@angular/core";
import { RouteInfo } from "../../models/sidebar.model";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";

var misc: any = {
  sidebar_mini_active: true,
};

export const ROUTES: RouteInfo[] = [
  {
    path: "/web/",
    title: "menu.account_overview",
    type: "sub",
    icontype: "fa fa-credit-card text-primary",
    isCollapsed: true,
    children: [
      { path: "warehouse-address", title: "menu.china_warehouse_address", type: "link" },
      {
        path: "international-shipping-rate",
        title: "menu.international_shipping_rate",
        type: "link",
      },
      {
        path: "domestic-shipping-rate",
        title: "menu.domestic_shipping_rate",
        type: "link",
      },
    ],
  },
  {
    path: "/web/",
    title: "menu.parcel_delivery_service",
    type: "sub",
    icontype: "fa fa-truck black",
    isCollapsed: true,
    children: [
      { path: "parcel-list", title: "menu.parcel_list", type: "link" },
      { path: "created-parcel-list", title: "menu.created_parcel_list", type: "link" },
      {
        path: "transport-payment",
        title: "menu.pending_transport_payment",
        type: "link",
      },
      { path: "goods-confirm", title: "menu.goods_confirm", type: "link" },
    ],
  },
  {
    path: "/web/",
    title: "menu.yuan_service",
    type: "sub",
    icontype: "fa fa-retweet text-danger",
    isCollapsed: true,
    children: [
      { path: "create-exchange", title: "menu.create_exchange", type: "link" },
      { path: "web", title: "menu.pending_payment_list", type: "link" },
      { path: "web", title: "menu.all_orders", type: "link" },
    ],
  },
  {
    path: "/web/bills",
    title: "menu.all_bills",
    type: "link",
    icontype: "fa fa-book text-info",
  },
  {
    path: "/web/",
    title: "menu.manage_agents",
    type: "sub",
    icontype: "ni ni-circle-08 text-danger",
    isCollapsed: true,
    children: [
      { path: "overview-manage-agent", title: "menu.agent_overview", type: "link" },
      { path: "agent", title: "menu.create_edit_agent", type: "link" },
      { path: "manage-parcel", title: "menu.manage_parcels", type: "link" },
      { path: "goal", title: "menu.set_goals", type: "link" },
    ],
  },
  {
    path: "/web/profile",
    title: "menu.member_info",
    type: "link",
    icontype: "fa fa-user salmon",
  },
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  public menuItems: any[];
  public isCollapsed = true;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
    this.checkResolution();
  }

  ngOnDestroy() {
    const body = document.querySelector("body");
    body.classList.remove("g-sidenav-hidden");
    body.classList.add("g-sidenav-pinned");
  }

  onMouseEnterSidenav() {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.add("g-sidenav-show");
    }
  }
  onMouseLeaveSidenav() {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-show");
    }
  }
  minimizeSidebar() {
    const sidenavToggler =
      document.getElementsByClassName("sidenav-toggler")[0];
    const body = document.getElementsByTagName("body")[0];
    if (body.classList.contains("g-sidenav-pinned")) {
      misc.sidebar_mini_active = true;
    } else {
      misc.sidebar_mini_active = false;
    }
    if (misc.sidebar_mini_active === true) {
      body.classList.remove("g-sidenav-pinned");
      body.classList.add("g-sidenav-hidden");
      sidenavToggler.classList.remove("active");
      misc.sidebar_mini_active = false;
    } else {
      body.classList.add("g-sidenav-pinned");
      body.classList.remove("g-sidenav-hidden");
      sidenavToggler.classList.add("active");
      misc.sidebar_mini_active = true;
    }
  }

  checkResolution() {
    const tabletResolution = window.matchMedia("(max-width:1200px)").matches;
    const body = document.querySelector("body");

    function hideSidebar() {
      body.classList.remove("g-sidenav-show");
      body.classList.remove("g-sidenav-pinned");
      body.classList.add("g-sidenav-hidden");
    }

    if (tabletResolution) {
      hideSidebar();
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth < 1200) {
        hideSidebar();
      }
    });
  }

  signOut() {
    this.authService.signOut();
  }
}
