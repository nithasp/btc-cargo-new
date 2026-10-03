import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
  AffiliateTeam,
  AffiliateMember,
  PriceInformations,
  ReRenderSelectAddressComponentMethod,
} from "../../../interfaces";
import { AffiliateService } from "../../../services";

@Component({
  selector: "app-agent",
  templateUrl: "./agent.component.html",
  styleUrls: ["./agent.component.scss"],
})
export class AgentComponent implements OnInit {
  id: number;
  affiliateCode: string = "";
  name: string;
  email: string;
  commissionType: string = "cost";
  referralCode: string = "RBTCXA11";
  commissionRate: number = 1;
  btcCode: string;
  sellingId: number;
  vat: string;
  // Costing Price
  costingWeightPrice: PriceInformations["weight_price"] = {
    p: null,
    d: null,
    hy: null,
    m: null,
    sp: null,
    sd: null,
  };
  costingVolumePrice: PriceInformations["volume_price"] = {
    p: null,
    d: null,
    hy: null,
    m: null,
    sp: null,
    sd: null,
  };
  // Selling Price
  sellingWeightPrice: PriceInformations["weight_price"] = {
    p: null,
    d: null,
    hy: null,
    m: null,
    sp: null,
    sd: null,
  };
  sellingVolumePrice: PriceInformations["volume_price"] = {
    p: null,
    d: null,
    hy: null,
    m: null,
    sp: null,
    sd: null,
  };

  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  isDisplaySelectAddress: boolean = true;

  isMainContentDisplay: boolean = false;
  teamId: number;
  teamSetting: AffiliateTeam["team_setting"];
  teamMembers: AffiliateMember[] = [];

  constructor(
    private affiliateService: AffiliateService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getTeamId();
  }

  getTeamId() {
    this.affiliateService
      .getTeamId()
      .subscribe((value) => (this.teamId = value));
  }

  getTeamMembers() {
    this.affiliateService
      .getAffiliateTeamDetail(this.teamId)
      .subscribe((res) => {
        this.teamMembers = res.data.team_members;
      });
  }

  setMainContentDisplay(value) {
    if (value.verificationState === true) {
      this.isMainContentDisplay = value.verificationState;
      this.teamSetting = value.teamData.team_setting;
      this.teamMembers = value.teamData.team_members;

      this.costingWeightPrice = {
        p: this.teamSetting.costing_id.weight_price.p,
        d: this.teamSetting.costing_id.weight_price.d,
        hy: this.teamSetting.costing_id.weight_price.hy,
        m: this.teamSetting.costing_id.weight_price.m,
        sp: this.teamSetting.costing_id.weight_price.sp,
        sd: this.teamSetting.costing_id.weight_price.sd,
      };
      this.costingVolumePrice = {
        p: this.teamSetting.costing_id.volume_price.p,
        d: this.teamSetting.costing_id.volume_price.d,
        hy: this.teamSetting.costing_id.volume_price.hy,
        m: this.teamSetting.costing_id.volume_price.m,
        sp: this.teamSetting.costing_id.volume_price.sp,
        sd: this.teamSetting.costing_id.volume_price.sd,
      };
    }
  }

  handleCommission(commissionTypeValue: string) {
    this.commissionType = commissionTypeValue;
  }

  onNewAddressSelected(address: string) {
    this.addressLine2 = address;
  }

  createAffiliate() {
    const body = {
      id: this.id,
      affiliate_code: this.affiliateCode,
      name: this.name,
      email: this.email,
      commission_type: this.commissionType,
      referral_code: this.referralCode,
      commission_rate: this.commissionRate,
      btc_code: this.btcCode,
      selling_id: {
        id: null,
        weight_price: {
          p: this.sellingWeightPrice.p,
          d: this.sellingWeightPrice.d,
          hy: this.sellingWeightPrice.hy,
          m: this.sellingWeightPrice.m,
          sp: this.sellingWeightPrice.sp,
          sd: this.sellingWeightPrice.sd,
        },
        volume_price: {
          p: this.sellingVolumePrice.p,
          d: this.sellingVolumePrice.d,
          hy: this.sellingVolumePrice.hy,
          m: this.sellingVolumePrice.m,
          sp: this.sellingVolumePrice.sp,
          sd: this.sellingVolumePrice.sd,
        },
      },
      vat: this.vat,
      affiliate_address: {
        phone_number: this.phoneNumber,
        line1: this.addressLine1,
        line2: this.addressLine2,
      },
    };

    this.affiliateService.createAffiliate(body).subscribe(
      (res: any) => {
        if (res.success === true) {
          if (this.id) {
            alert("อัพเดทข้อมูลสำเร็จ");
          } else {
            alert("สร้างรหัสผู้แนะนำสำเร็จ");
          }
          this.getTeamMembers();
          this.clearFormValue();
          this.reRenderSelectAddressComponent(
            "",
            ReRenderSelectAddressComponentMethod.Clear
          );
        } else {
          alert("กรุณากรอกข้อมูลของท่านให้ครบ");
        }
      },
      (err) => {
        console.log(err);
        if (err.error.message.includes("email")) {
          alert("กรุณากรอกข้อมูลของท่านให้ครบ");
        }
        alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง");
      }
    );
  }

  editSellingPrice(item) {
    this.id = item.id;
    this.affiliateCode = item.affiliate_code;
    this.sellingWeightPrice = {
      p: item.selling_id.weight_price.p,
      d: item.selling_id.weight_price.d,
      hy: item.selling_id.weight_price.hy,
      m: item.selling_id.weight_price.m,
      sp: item.selling_id.weight_price.sp,
      sd: item.selling_id.weight_price.sd,
    };
    this.sellingVolumePrice = {
      p: item.selling_id.volume_price.p,
      d: item.selling_id.volume_price.d,
      hy: item.selling_id.volume_price.hy,
      m: item.selling_id.volume_price.m,
      sp: item.selling_id.volume_price.sp,
      sd: item.selling_id.volume_price.sd,
    };
    this.btcCode = item.btc_code;
    this.name = item.name;
    this.vat = item.vat;
    this.phoneNumber = item.affiliate_address.phone_number;
    this.email = item.email;
    this.addressLine1 = item.affiliate_address.line1;
    this.reRenderSelectAddressComponent(
      item,
      ReRenderSelectAddressComponentMethod.Update
    );
    setTimeout(() => {
      this.scrollToTop();
    }, 100);
  }

  reRenderSelectAddressComponent(item, method) {
    if (method === ReRenderSelectAddressComponentMethod.Update) {
      this.addressLine2 = item.affiliate_address.line2;
    }
    if (method === ReRenderSelectAddressComponentMethod.Clear) {
      this.addressLine2 = undefined;
    }
    this.isDisplaySelectAddress = false;
    this.changeDetectorRef.detectChanges();
    this.isDisplaySelectAddress = true;
  }

  clearFormValue() {
    this.id = undefined;
    this.affiliateCode = "";
    this.sellingWeightPrice = {
      p: null,
      d: null,
      hy: null,
      m: null,
      sp: null,
      sd: null,
    };
    this.sellingVolumePrice = {
      p: null,
      d: null,
      hy: null,
      m: null,
      sp: null,
      sd: null,
    };

    this.btcCode = "";
    this.name = "";
    this.vat = "";
    this.phoneNumber = "";
    this.email = "";
    this.addressLine1 = "";
    this.addressLine2 = "";
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
  }
}
