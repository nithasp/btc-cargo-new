import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup } from "@angular/forms"
import { Router } from "@angular/router"
import liff from "@line/liff/dist/lib"
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthService,
} from "angularx-social-login"
import { addresses as addressList } from "../../../model/addresses"
import {
  AddressService,
  ApiService,
  AuthService,
  UserService,
} from "../../services"

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  baseUrl: string
  liffId: any = "1656798245-1XOVnk67"
  userForm1: FormGroup
  userForm2: FormGroup
  userInfo: any
  bsValue: any

  isDateValid: boolean = true
  isUpdateSuccess: boolean
  modalBoxMsg: string

  isDisplayAddAddress: boolean = false
  isDisplayAddress: boolean = false
  isDisplayConfirmDeleteAddress: boolean = false
  isDisplayFailDeleteAddress: boolean = false
  isDisplayConfirmRevokeLineNotify: boolean = false

  // Address
  addresses = []
  isDisableSaveButton: boolean

  // Add address
  newAddressName: string
  newReceiverName: string
  newTelephone: string
  isCheckAddJuristic: boolean
  newVat: string
  newAddressLine1: string
  newAddressLine2: string

  // Edit address
  selectedAddress: any
  addressName: string
  receiverName: string
  telephone: string
  isCheckJuristic: boolean
  vat: string
  addressLine1: string
  addressLine2: string

  // Delete address
  targetDeleteAddressName: string
  targetDeleteAddressId: number

  isCheckBillingAddress: boolean
  isCheckShippingAddress: boolean
  isCheckAddBillingAddress: boolean
  isCheckAddShippingAddress: boolean

  billingAddressId: number
  shippingAddressId: number

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private socialAuthService: SocialAuthService,
    private addressService: AddressService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.baseUrl = this.apiService.baseUrl
    this.isLineLogin()
    this.subscribeGlobalUserInfo()
    this.userForm1Init()
    this.userForm2Init()
    this.getAddress()
    this.billingAddressId = this.userInfo.extendeduser.billingAddressId ?? 0
    this.shippingAddressId = this.userInfo.extendeduser.shippingAddressId ?? 0
    if (!this.userInfo.extendeduser.has_consent) {
      this.router.navigate(["/pdpa-conditions"])
    }
  }

  subscribeGlobalUserInfo() {
    this.authService.getUserInfo().subscribe((value) => (this.userInfo = value))
  }

  userForm1Init(): void {
    this.userForm1 = this.formBuilder.group({
      first_name: [this.userInfo?.first_name],
      last_name: [this.userInfo?.last_name],
      email: [this.userInfo?.email],

      extendeduser: this.formBuilder.group({
        birthDate: [new Date(this.userInfo.extendeduser?.birthDate ?? null)],
        address: [""],
        city: [""],
        country: [""],
        postcode: [""],
        billAddress: [""],
      }),
    })
  }

  userForm2Init(): void {
    this.userForm2 = this.formBuilder.group({
      extendeduser: this.formBuilder.group({
        telephone: [this.userInfo.extendeduser?.telephone],
        google: [this.userInfo.extendeduser?.google],
        facebook: [this.userInfo.extendeduser?.facebook],
        line: [this.userInfo.extendeduser?.line],
      }),
    })
  }

  handleSubmitUserForm1(): void {
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken) {
      const httpHeadersValue = new HttpHeaders({
        "content-type": "application/json",
        Authorization: `Token ${accessToken}`,
      })

      const dateValue = Date.parse(this.userForm1.value.extendeduser.birthDate)
      let dateValue2
      const isNan: any = () => {
        if (isNaN(dateValue)) {
          dateValue2 = "Date Invalid"
          this.isDateValid = false
        } else {
          const tzoffset = new Date().getTimezoneOffset() * 60000
          const dateValueISO = new Date(dateValue - tzoffset)
            .toISOString()
            .split("T")[0]
          dateValue2 = dateValueISO
        }
      }
      isNan()

      const userForm1Value = {
        ...this.userForm1.value,
        first_name: this.userForm1.value["first_name"].replace(/\s/g, ""),
        last_name: this.userForm1.value["last_name"].replace(/\s/g, ""),
        extendeduser: {
          birthDate: dateValue2,
        },
      }

      this.http
        .put<any>(`${this.baseUrl}/api/user/`, userForm1Value, {
          headers: httpHeadersValue,
        })
        .subscribe(
          (res) => {
            this.isDateValid = true
            this.isUpdateSuccess = true
            this.userInfo.first_name = res.first_name
            this.modalBoxMsg = "โปรไฟล์ของคุณอัพเดทเรียบร้อยแล้ว"
            this.goToModalBox()
          },
          (err) => {
            console.log(err)
            this.isUpdateSuccess = false
            this.modalBoxMsg =
              "อัพเดทโปรไฟล์ไม่สำเร็จ กรุณาตรวจสอบความถูกต้องของข้อมูล"
            this.goToModalBox()
          }
        )
    }
  }

  handleSubmitUserForm2(): void {
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken) {
      const httpHeadersValue = new HttpHeaders({
        "content-type": "application/json",
        Authorization: `Token ${accessToken}`,
      })

      const userForm2Value = {
        extendeduser: {
          ...this.userForm2.value.extendeduser,
        },
      }

      this.http
        .put<any>(`${this.baseUrl}/api/user/`, userForm2Value, {
          headers: httpHeadersValue,
        })
        .subscribe(
          (res) => {
            this.isUpdateSuccess = true
            this.modalBoxMsg = "โปรไฟล์ของคุณอัพเดทเรียบร้อยแล้ว"
            this.goToModalBox()
          },
          (err) => {
            console.log(err)
            this.isUpdateSuccess = false
            this.modalBoxMsg =
              "อัพเดทโปรไฟล์ไม่สำเร็จ กรุณาตรวจสอบความถูกต้องของข้อมูล"
            this.goToModalBox()
          }
        )
    }
  }

  goToModalBox(): void {
    const modalBox: any = document.querySelector(".update-profile-modal-box")
    modalBox.classList.add("active")

    const modalBoxPosition =
      modalBox.getBoundingClientRect().top + window.scrollY
    window.scroll({
      top: modalBoxPosition - 70,
      behavior: "smooth",
    })

    setTimeout(() => {
      modalBox.classList.add("sticky")
    }, 1000)
  }

  closeModalBox(): void {
    const modalBox: any = document.querySelector(".update-profile-modal-box")
    modalBox.classList.remove("sticky")
    modalBox.classList.remove("active")
  }

  connectBtcSocials(authToken: any, provider: string, idToken: any) {
    const accessToken = localStorage.getItem("accessToken")
    const httpHeadersValue = new HttpHeaders({
      "content-type": "application/json",
      Authorization: `Token ${accessToken}`,
    })

    if (provider === "google") {
      this.http
        .post<any>(
          `${this.baseUrl}/api/auth/google`,
          {
            access_token: authToken,
          },
          { headers: httpHeadersValue }
        )
        .subscribe(
          (res) => {
            alert("เชื่อมต่อสำเร็จ")
            this.updateUser()
          },
          (err) => {
            console.log(err)
            alert("เชื่อมต่อไม่สำเร็จ")
          }
        )
    }

    if (provider === "facebook") {
      this.http
        .post<any>(
          `${this.baseUrl}/api/auth/facebook`,
          {
            access_token: authToken,
          },
          { headers: httpHeadersValue }
        )
        .subscribe(
          (res) => {
            alert("เชื่อมต่อสำเร็จ")
            this.updateUser()
          },
          (err) => {
            console.log(err)
            alert("เชื่อมต่อไม่สำเร็จ")
          }
        )
    }

    if (provider === "line") {
      this.http
        .post<any>(
          `${this.baseUrl}/api/auth/line`,
          {
            access_token: authToken,
            id_token: idToken,
          },
          { headers: httpHeadersValue }
        )
        .subscribe(
          (res) => {
            alert("เชื่อมต่อสำเร็จ")
            this.lineLogout()
            this.updateUser()
          },
          (err) => {
            console.log(err)
            alert("เชื่อมต่อไม่สำเร็จ")
          }
        )
    }

    if (provider === "regLineNotify") {
      this.http
        .get<any>(`${this.baseUrl}/api/line_notify/link/`, {
          headers: httpHeadersValue,
        })
        .subscribe(
          (res) => {
            window.location.href = res.url
          },
          (err) => {
            console.log(err)
            alert("เชื่อมต่อไม่สำเร็จ")
          }
        )
    }

    if (provider === "revokeLineNotify") {
      this.http
        .post<any>(`${this.baseUrl}/api/line_notify/revoke/`, null, {
          headers: httpHeadersValue,
        })
        .subscribe(
          (res) => {
            if (res.success) {
              this.isDisplayConfirmRevokeLineNotify = false
              this.userInfo.extendeduser.line_notify = false
            }
          },
          (err) => {
            console.log(err)
            alert("เชื่อมต่อไม่สำเร็จ")
          }
        )
    }
  }

  connectGoogle(): void {
    this.socialAuthService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((res) => {
        const authToken = res.authToken
        this.connectBtcSocials(authToken, "google", "")
      })
      .catch((err) => {
        console.log(err)
        alert("เชื่อมต่อไม่สำเร็จ")
      })
  }

  connectFacebook(): void {
    this.socialAuthService
      .signIn(FacebookLoginProvider.PROVIDER_ID)
      .then((res) => {
        const authToken = res.authToken
        this.connectBtcSocials(authToken, "facebook", "")
      })
      .catch((err) => {
        console.log(err)
      })
  }

  // Line Connect Functions
  connectLine(): void {
    liff.init(
      { liffId: this.liffId },
      () => {
        liff.login()
      },
      (err) => {
        console.error(err)
      }
    )
  }

  connectLineNotify(): void {
    this.connectBtcSocials("", "regLineNotify", "")
  }

  disconnectLineNotify(): void {
    this.connectBtcSocials("", "revokeLineNotify", "")
  }

  isLineLogin(): void {
    liff.init({ liffId: this.liffId }, () => {
      if (liff.isLoggedIn()) {
        this.runApp()
      }
    })
  }
  runApp(): void {
    const idToken = liff.getIDToken()
    const accessTokenLine = liff.getAccessToken()
    this.connectBtcSocials(accessTokenLine, "line", idToken)
  }
  lineLogout(): void {
    liff.logout()
  }

  updateUser(): void {
    const accessToken = localStorage.getItem("accessToken")
    const httpHeadersValue = new HttpHeaders({
      "content-type": "application/json",
      Authorization: `Token ${accessToken}`,
    })
    this.http
      .get<any>(`${this.baseUrl}/api/user/`, {
        headers: httpHeadersValue,
      })
      .subscribe(
        (res) => {
          this.authService.userInfo.next(res)
        },
        (err) => {
          console.log(err, err.error.detail)
        }
      )
  }

  checkAbleToDeleteAddress(id: number) {
    this.targetDeleteAddressName = this.addresses.find(
      (item) => item.id === id
    ).name
    this.targetDeleteAddressId = id

    if (this.billingAddressId === id || this.shippingAddressId === id) {
      this.isDisplayFailDeleteAddress = true
    } else {
      this.onDisplayConfirmDeleteAddress(id)
    }
  }

  onCloseAddAddressModal() {
    this.isDisplayAddAddress = false
    this.newAddressName = undefined
    this.newReceiverName = undefined
    this.newTelephone = undefined
    this.isCheckAddJuristic = false
    this.newVat = undefined
    this.newAddressLine1 = undefined
    this.newAddressLine2 = undefined
  }

  onDisplayConfirmDeleteAddress(id: number) {
    this.isDisplayConfirmDeleteAddress = true
  }

  transformAddress(district: string) {
    const addrList = addressList
      .find((address) => address.id === district)
      .text.split(", ")
    addrList.push(addrList.shift())
    return addrList.join(", ")
  }

  onNewAddressSelected(address: string) {
    this.newAddressLine2 = address
  }

  onUpdateAddressSelected(address: string) {
    this.addressLine2 = address
  }

  onEditAddress(id: number) {
    this.selectedAddress = this.addresses.find((item) => item.id === id)
    this.addressName = this.selectedAddress.name
    this.receiverName = this.selectedAddress.person
    this.telephone = this.selectedAddress.telephone
    this.isCheckJuristic = this.selectedAddress.is_juristic
    this.vat = this.selectedAddress.vat
    this.addressLine1 = this.selectedAddress.address
    this.addressLine2 = this.selectedAddress.district

    this.isCheckShippingAddress =
      this.selectedAddress.id === this.shippingAddressId ? true : false
    this.isCheckBillingAddress =
      this.selectedAddress.id === this.billingAddressId ? true : false

    this.isDisplayAddress = true
  }

  getAddress() {
    this.addressService.getAddress().subscribe((response: any) => {
      this.addresses = response.sort((a, b) => a.id - b.id)
    })
  }

  async createAddress() {
    const isFirstAddress = this.addresses.length === 0
    const addr = {
      name: this.newAddressName,
      person: this.newReceiverName,
      telephone: this.newTelephone,
      is_juristic: this.isCheckAddJuristic,
      vat: this.newVat,
      address: this.newAddressLine1,
      district: this.newAddressLine2,
      user: this.userInfo.id,
    }

    let id = (await this.addressService.createAddress(addr).toPromise()).id
    this.getAddress()

    const addrDetail = {
      ...this.userInfo,
      extendeduser: {
        ...this.userInfo.extendeduser,
        billingAddressId:
          this.isCheckAddBillingAddress || isFirstAddress
            ? id
            : this.userInfo.extendeduser.billingAddressId ??
              this.addresses[0].id,
        shippingAddressId:
          this.isCheckAddShippingAddress || isFirstAddress
            ? id
            : this.userInfo.extendeduser.shippingAddressId ??
              this.addresses[0].id,
      },
    }

    if (
      this.isCheckAddBillingAddress ||
      this.isCheckAddShippingAddress ||
      isFirstAddress
    ) {
      this.userService.updateUser(addrDetail).subscribe(
        (response: any) => {
          this.authService.userInfo.next(response)
          this.billingAddressId = response.extendeduser.billingAddressId
          this.shippingAddressId = response.extendeduser.shippingAddressId
        },
        (error) => {
          console.log("error ", error)
        }
      )
    }

    this.isDisplayAddAddress = false
    this.isCheckAddShippingAddress = false
    this.isCheckAddBillingAddress = false
    this.newAddressName = undefined
    this.newReceiverName = undefined
    this.newTelephone = undefined
    this.isCheckAddJuristic = false
    this.newVat = undefined
    this.newAddressLine1 = undefined
    this.newAddressLine2 = undefined
  }

  updateAddress() {
    const addr = {
      name: this.addressName,
      person: this.receiverName,
      telephone: this.telephone,
      is_juristic: this.isCheckJuristic,
      vat: this.vat,
      address: this.addressLine1,
      district: this.addressLine2,
      user: this.userInfo.id,
    }

    this.addressService.updateAddress(addr, this.selectedAddress.id).subscribe(
      () => {
        this.getAddress()
      },
      (error) => {
        console.log("error ", error)
      }
    )

    const addrDetail = {
      ...this.userInfo,
      extendeduser: {
        ...this.userInfo.extendeduser,
        billingAddressId: this.isCheckBillingAddress
          ? this.selectedAddress.id
          : this.userInfo.extendeduser.billingAddressId,
        shippingAddressId: this.isCheckShippingAddress
          ? this.selectedAddress.id
          : this.userInfo.extendeduser.shippingAddressId,
      },
    }
    this.userService.updateUser(addrDetail).subscribe(
      (response: any) => {
        this.authService.userInfo.next(response)
        this.billingAddressId = response.extendeduser.billingAddressId
        this.shippingAddressId = response.extendeduser.shippingAddressId
      },
      (error) => {
        console.log("error ", error)
      }
    )
    this.isDisplayAddress = false
  }

  deleteAddress() {
    this.addressService.deleteAddress(this.targetDeleteAddressId).subscribe(
      (response: any) => {
        this.getAddress()
      },
      (error) => {
        console.log("error ", error)
      }
    )

    this.isDisplayConfirmDeleteAddress = false
    this.targetDeleteAddressId = undefined
    this.targetDeleteAddressName = undefined
  }
}
