import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { addresses as addressList } from "../../../../model/addresses";
import { expressList } from "../../../../model/express-list";
import { provincesData } from "../../../../model/thai-provinces";
import {
  Address,
  LocalDelivery,
  Provinces,
  Quotation,
  ThaiCarrier,
  UserInfo,
} from "../../../interfaces";
import {
  AddressService,
  AuthService,
  MasterDataService,
  QuotationService,
  UserService,
} from "../../../services";

@Component({
  selector: "app-create-bill",
  templateUrl: "./create-bill.component.html",
  styleUrls: ["./create-bill.component.scss"],
})
export class CreateBillComponent implements OnInit {
  userInfo: UserInfo;

  isDisplayAddAddress: boolean = false;
  modalButtonMsg: string = "บันทึก";
  provinces: Provinces[] = provincesData;
  expressList: string[] = expressList;
  isExpressDisplay: boolean = true;
  shippingAddressValue: string = "ที่อยู่จัดส่ง 1";
  billingAddressValue: string = "ที่อยู่สำหรับใบเสร็จ/ใบส่งสินค้า 1";

  addresses = [];
  newAddressName: string;
  newReceiverName: string;
  newTelephone: string;
  isCheckAddJuristic: boolean;
  newVat: string;
  newAddressLine1: string;
  newAddressLine2: string;

  shippingAddress: Address;
  billingAddress: Address;
  defaultShippingAddress: Address;
  defaultBillingAddress: Address;
  billingAddressId: number;
  shippingAddressId: number;

  abbDistrict: string;
  expresses: LocalDelivery[];
  localDelivery: LocalDelivery[] = [];
  localDeliveryId: number;

  isCheckAddBillingAddress: boolean;
  isCheckAddShippingAddress: boolean;

  quotations: any;

  carrier: ThaiCarrier;
  carriers: ThaiCarrier[];

  totalDeliveryCost: number = 0;
  totalOtherCost: number = 0;
  totalThOtherCost: number = 0;
  totalStorageCost: number = 0;

  totalPrice: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private addressService: AddressService,
    private userService: UserService,
    private quotationService: QuotationService,
    private masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.getAddress();
    this.getQuotationList();
    this.getCarrierType();
    this.getLocalDelivery();

    this.billingAddressId = this.userInfo.extendeduser.billingAddressId;
    this.shippingAddressId = this.userInfo.extendeduser.shippingAddressId;
  }

  getUserInfo(): void {
    this.authService.getUserInfo().subscribe((value) => {
      this.userInfo = value;
    });
  }

  filterExpress(id: string): void {
    const province = this.provinces.find((province) => province.id === id);
    this.expressList = province.express_list;
  }

  getAddress(): void {
    this.addressService.getAddress().subscribe((response: any) => {
      this.addresses = response.sort((a, b) => a.id - b.id);
      //Get Default Address
      const defaultShippingAddress = response.find(
        (addr: Address) =>
          addr.id === this.userInfo.extendeduser.shippingAddressId
      );
      const defaultBillingAddress = response.find(
        (addr: Address) =>
          addr.id === this.userInfo.extendeduser.billingAddressId
      );
      this.defaultShippingAddress = defaultShippingAddress;
      this.defaultBillingAddress = defaultBillingAddress;
      this.shippingAddress = defaultShippingAddress;
      this.billingAddress = defaultBillingAddress;

      const abbDistrict = defaultShippingAddress.district.substring(0, 2);
      this.abbDistrict = abbDistrict;
    });
  }

  getQuotationList(): void {
    this.quotationService.getQuotationList().subscribe((value) => {
      this.quotations = value;
      this.calculateQuotationTotalPrice();
    });
  }

  calculateQuotationTotalPrice() {
    const totalDeliveryCost = this.quotations.reduce((acc, item) => {
      return (acc += item.lot.delivery_cost);
    }, 0);
    const totalOtherCost = this.quotations.reduce((acc, item) => {
      return (acc += item.lot.other_cost);
    }, 0);
    const totalThOtherCost = this.quotations.reduce((acc, item) => {
      return (acc += item.lot.th_other_cost);
    }, 0);
    const totalStorageCost = this.quotations.reduce((acc, item) => {
      return (acc += item.lot.storage_cost);
    }, 0);

    this.totalDeliveryCost = totalDeliveryCost.toFixed(2);
    this.totalOtherCost = totalOtherCost.toFixed(2);
    this.totalThOtherCost = totalThOtherCost.toFixed(2);
    this.totalStorageCost = totalStorageCost.toFixed(2);

    this.totalPrice = (
      totalDeliveryCost +
      totalOtherCost +
      totalThOtherCost
    ).toFixed(2);
  }

  getCarrierType(): void {
    this.masterDataService.getThaiCarriers().subscribe((value) => {
      this.carrier = value.data[0];
      this.carriers = value.data;
    });
  }

  getLocalDelivery(): void {
    this.masterDataService.getLocalDelivery().subscribe((value) => {
      this.expresses = value.data;
      const subDistrict = value.data.filter((i) => {
        return i.sub_district_codes.includes(
          this.defaultShippingAddress.district
        );
      });
      const defaultLocalDelivery = value.data.filter((i) => {
        return i.province_codes.includes(this.abbDistrict);
      });

      if (subDistrict.length === 0 && defaultLocalDelivery.length === 0) {
        this.localDelivery = [];
        this.localDeliveryId = null;
      } else if (subDistrict.length > 0) {
        const selectedExpress = [...subDistrict, ...defaultLocalDelivery];
        this.localDelivery = selectedExpress;
        this.localDeliveryId = selectedExpress[0].id;
      } else {
        this.localDelivery = defaultLocalDelivery;
        this.localDeliveryId = defaultLocalDelivery[0].id;
      }
    });
  }

  transformAddress(district: string) {
    const addrList = addressList
      .find((address) => address.id === district)
      .text.split(", ");
    addrList.push(addrList.shift());
    return addrList.join(", ");
  }

  async createAddress() {
    const addr = {
      name: this.newAddressName,
      person: this.newReceiverName,
      telephone: this.newTelephone,
      is_juristic: this.isCheckAddJuristic,
      vat: this.newVat,
      address: this.newAddressLine1,
      district: this.newAddressLine2,
      user: this.userInfo.id,
    };
    const id = (await this.addressService.createAddress(addr).toPromise()).id;
    this.getAddress();

    if (this.isCheckAddBillingAddress || this.isCheckAddShippingAddress) {
      const addrDetail = {
        ...this.userInfo,
        extendeduser: {
          ...this.userInfo.extendeduser,
          billingAddressId: this.isCheckAddBillingAddress
            ? id
            : this.userInfo.extendeduser.billingAddressId,
          shippingAddressId: this.isCheckAddShippingAddress
            ? id
            : this.userInfo.extendeduser.shippingAddressId,
        },
      };
      this.userService.updateUser(addrDetail).subscribe(
        (response: any) => {},
        (error) => {
          console.log("error ", error);
        }
      );
    }

    this.isDisplayAddAddress = false;
    this.newAddressName = undefined;
    this.newReceiverName = undefined;
    this.newTelephone = undefined;
    this.isCheckAddJuristic = false;
    this.newVat = undefined;
    this.newAddressLine1 = undefined;
    this.newAddressLine2 = undefined;

    this.isCheckAddBillingAddress = undefined;
    this.isCheckAddShippingAddress = undefined;
  }

  onCloseAddAddress() {
    this.isDisplayAddAddress = false;
    this.newAddressName = undefined;
    this.newReceiverName = undefined;
    this.newTelephone = undefined;
    this.isCheckAddJuristic = false;
    this.newVat = undefined;
    this.newAddressLine1 = undefined;
    this.newAddressLine2 = undefined;

    this.isCheckAddBillingAddress = undefined;
    this.isCheckAddShippingAddress = undefined;
  }

  onNewAddressSelected(address: string) {
    this.newAddressLine2 = address;
  }

  createQuotation() {
    const getChinaTrackingIds = this.quotations.map(
      (quotation) => quotation.lot.id
    );
    const body = {
      carrier_id: this.carrier.id,
      local_delivery_id: this.localDeliveryId,
      delivery_address: {
        name: this.shippingAddress.person,
        phone_number: this.shippingAddress.telephone,
        line1: this.shippingAddress.address,
        line2: this.shippingAddress.district,
      },
      invoice_address: {
        name: this.billingAddress.person,
        phone_number: this.billingAddress.telephone,
        line1: this.billingAddress.address,
        line2: this.billingAddress.district,
        vat: this.billingAddress.vat,
        is_juristic: this.billingAddress.is_juristic,
      },
      china_tracking_ids: getChinaTrackingIds,
    };
    this.quotationService.createQuotation(body).subscribe(
      (res) => {
        this.router.navigate(["/web/bills"]);
      },
      (err) => {
        console.log(err);
        alert("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง");
      }
    );
  }

  handleDeliveryMethod(value: string) {
    const id = Number(value);
    const matchedCarrier = this.carriers.find((carrier) => carrier.id === id);
    if (matchedCarrier.id === 2) {
      this.isExpressDisplay = true;
      const abbDistrict = this.shippingAddress.district.substring(0, 2);
      const matchedSubDistrict = this.expresses.filter((i) => {
        return i.sub_district_codes.includes(this.shippingAddress.district);
      });
      const matchedProvinceCodes = this.expresses.filter((i) => {
        return i.province_codes.includes(abbDistrict);
      });

      if (
        matchedSubDistrict.length === 0 &&
        matchedProvinceCodes.length === 0
      ) {
        this.localDelivery = [];
        this.localDeliveryId = null;
      } else if (matchedSubDistrict.length > 0) {
        const selectedExpress = [
          ...matchedSubDistrict,
          ...matchedProvinceCodes,
        ];
        this.localDelivery = selectedExpress;
        this.localDeliveryId = selectedExpress[0].id;
      } else {
        this.localDelivery = matchedProvinceCodes;
        this.localDeliveryId = matchedProvinceCodes[0].id;
      }
    } else {
      this.isExpressDisplay = false;
      this.localDeliveryId = null;
    }
    this.carrier = matchedCarrier;
  }

  handleShippingAddress(value: string) {
    const id = Number(value);
    const matchedShippingAddress = this.addresses.find(
      (address) => address.id === id
    );
    this.shippingAddress = matchedShippingAddress;

    if (this.isExpressDisplay) {
      const abbDistrict = matchedShippingAddress.district.substring(0, 2);
      const matchedSubDistrict = this.expresses.filter((i) => {
        return i.sub_district_codes.includes(matchedShippingAddress.district);
      });
      const matchedProvinceCodes = this.expresses.filter((i) => {
        return i.province_codes.includes(abbDistrict);
      });

      if (
        matchedSubDistrict.length === 0 &&
        matchedProvinceCodes.length === 0
      ) {
        this.localDelivery = [];
        this.localDeliveryId = null;
      } else if (matchedSubDistrict.length > 0) {
        const selectedExpress = [
          ...matchedSubDistrict,
          ...matchedProvinceCodes,
        ];
        this.localDelivery = selectedExpress;
        this.localDeliveryId = selectedExpress[0].id;
      } else {
        this.localDelivery = matchedProvinceCodes;
        this.localDeliveryId = matchedProvinceCodes[0].id;
      }
    }
  }

  handleBillingAddress(value: string) {
    const id = Number(value);
    const matchedBillingAddress = this.addresses.find(
      (address) => address.id === id
    );
    this.billingAddress = matchedBillingAddress;
  }

  handleChangeExpress(value: string) {
    const id = Number(value);
    this.localDeliveryId = id;
  }

  onCancel() {
    this.router.navigate(["/web/transport-payment"]);
  }

  isSubmitDisabled() {
    return (
      this.carrier && this.carrier.id === 2 && this.localDelivery.length === 0
    );
  }
}
