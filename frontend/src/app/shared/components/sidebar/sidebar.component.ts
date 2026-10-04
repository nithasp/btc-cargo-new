import { Component, OnInit } from "@angular/core";
import { RouteInfo } from "src/app/custom/interfaces";
import { AuthService } from "src/app/custom/services/auth.service";
import { Router } from "@angular/router";

var misc: any = {
  sidebar_mini_active: true,
};

//Menu Items
export const ROUTES: RouteInfo[] = [
  // Source code
  // {
  //   path: "/dashboards",
  //   title: "Dashboards",
  //   type: "sub",
  //   icontype: "ni-shop text-primary",
  //   isCollapsed: true,
  //   children: [
  //     { path: "dashboard", title: "Dashboard", type: "link" },
  //     { path: "alternative", title: "Alternative", type: "link" },
  //   ],
  // },
  // {
  //   path: "/examples",
  //   title: "Examples",
  //   type: "sub",
  //   icontype: "ni-ungroup text-orange",
  //   collapse: "examples",
  //   isCollapsed: true,
  //   children: [
  //     { path: "pricing", title: "Pricing", type: "link" },
  //     { path: "login", title: "Login", type: "link" },
  //     { path: "register", title: "Register", type: "link" },
  //     { path: "lock", title: "Lock", type: "link" },
  //     { path: "timeline", title: "Timeline", type: "link" },
  //     { path: "profile", title: "Profile", type: "link" },
  //   ],
  // },
  // {
  //   path: "/components",
  //   title: "Components",
  //   type: "sub",
  //   icontype: "ni-ui-04 text-info",
  //   collapse: "components",
  //   isCollapsed: true,
  //   children: [
  //     { path: "buttons", title: "Buttons", type: "link" },
  //     { path: "cards", title: "Cards", type: "link" },
  //     { path: "grid", title: "Grid", type: "link" },
  //     { path: "notifications", title: "Notifications", type: "link" },
  //     { path: "icons", title: "Icons", type: "link" },
  //     { path: "typography", title: "Typography", type: "link" },
  //     {
  //       path: "multilevel",
  //       isCollapsed: true,
  //       title: "Multilevel",
  //       type: "sub",
  //       collapse: "multilevel",
  //       children: [
  //         { title: "Third level menu" },
  //         { title: "Just another link" },
  //         { title: "One last link" },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   path: "/forms",
  //   title: "Forms",
  //   type: "sub",
  //   icontype: "ni-single-copy-04 text-pink",
  //   collapse: "forms",
  //   isCollapsed: true,
  //   children: [
  //     { path: "elements", title: "Elements", type: "link" },
  //     { path: "components", title: "Components", type: "link" },
  //     { path: "validation", title: "Validation", type: "link" },
  //   ],
  // },
  // {
  //   path: "/tables",
  //   title: "Tables",
  //   type: "sub",
  //   icontype: "ni-align-left-2 text-default",
  //   collapse: "tables",
  //   isCollapsed: true,
  //   children: [
  //     { path: "tables", title: "Tables", type: "link" },
  //     { path: "sortable", title: "Sortable", type: "link" },
  //     { path: "ngx-datatable", title: "Ngx Datatable", type: "link" },
  //   ],
  // },
  // {
  //   path: "/maps",
  //   title: "Maps",
  //   type: "sub",
  //   icontype: "ni-map-big text-primary",
  //   collapse: "maps",
  //   isCollapsed: true,
  //   children: [
  //     { path: "google", title: "Google Maps", type: "link" },
  //     { path: "vector", title: "Vector Map", type: "link" },
  //   ],
  // },
  // {
  //   path: "/widgets",
  //   title: "Widgets",
  //   type: "link",
  //   icontype: "ni-archive-2 text-green",
  // },
  // {
  //   path: "/charts",
  //   title: "Charts",
  //   type: "link",
  //   icontype: "ni-chart-pie-35 text-info",
  // },
  // {
  //   path: "/calendar",
  //   title: "Calendar",
  //   type: "link",
  //   icontype: "ni-calendar-grid-58 text-red",
  // },

  // Custom Code //
  // {
  //   path: "/web/qr-scanner",
  //   title: "Scanner",
  //   type: "link",
  //   icontype: "fa fa-barcode salmon",
  // },
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
  // {
  //   path: "/web/",
  //   title: "บริการสั่งซื้อและนําเข้าสินค้า",
  //   type: "sub",
  //   icontype: "fa fa-cart-plus text-success",
  //   isCollapsed: true,
  //   children: [
  //     { path: "purchase", title: "สั่งซื้อสินค้า", type: "link" },
  //     { path: "web", title: "รายการรอชําระเงิน", type: "link" },
  //     { path: "orderdetail", title: "รายละเอียดการสั่งซื้อ", type: "link" },
  //     { path: "tracking", title: "ติดตามสถานะสินค้า", type: "link" },
  //   ],
  // },
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
  // {
  //   path: "/web/",
  //   title: "บริการจัดจำหน่ายสินค้า",
  //   type: "sub",
  //   icontype: "fa fa-building text-warning",
  //   isCollapsed: true,
  //   children: [
  //     { path: "find-product", title: "ค้นหาสินค้า", type: "link" },
  //     { path: "cart", title: "สั่งซื้อสินค้า", type: "link" },
  //     {
  //       path: "order-detail-consignment",
  //       title: "รายละเอียดการสั่งซื้อ",
  //       type: "link",
  //     },
  //     { path: "pending-payment-list", title: "รายการรอชำระเงิน", type: "link" },
  //     {
  //       path: "tracking-consignment",
  //       title: "ติดตามสถานะสินค้า",
  //       type: "link",
  //     },
  //   ],
  // },
  {
    path: "/web/bills",
    title: "menu.all_bills",
    type: "link",
    icontype: "fa fa-book text-info",
  },
  // {
  //   path: "/web/discount",
  //   title: "ส่วนลดของฉัน",
  //   type: "link",
  //   icontype: "fa fa-tags text-muted",
  // },
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
