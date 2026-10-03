import { Component, OnInit } from "@angular/core"
import { Wallet } from "../../interfaces"
import { WalletService } from "../../services"
import * as moment from "moment";

@Component({
  selector: "app-wallets",
  templateUrl: "./wallets.component.html",
  styleUrls: ["./wallets.component.scss"],
})
export class WalletsComponent implements OnInit {
  constructor(private walletService: WalletService) {}
  wallets: Wallet[]

  isDisplayAddModal: boolean = false
  isDisplayEditModal: boolean = false
  isDisplayConfirmDeleteModal: boolean = false

  addWalletName: string = ""
  editWalletName: string = ""

  editingWallet: Wallet
  deletingWallet: Wallet

  ngOnInit(): void {
    this.getWallets()
  }

  displayAddModal() {
    this.isDisplayAddModal = true
  }

  displayEditModal(id) {
    this.editingWallet = this.wallets.find((wallet) => wallet.id === id)
    this.editWalletName = this.editingWallet.name
    this.isDisplayEditModal = true
  }

  displayConfirmDeleteModal(id) {
    this.deletingWallet = this.wallets.find((wallet) => wallet.id === id)
    this.isDisplayConfirmDeleteModal = true
  }

  isValidName(key) {
    if (key === "add") {
      return !this.wallets.find((wallet) => wallet.name === this.addWalletName)
    }
    if (key === "edit") {
      return !this.wallets.find(
        (wallet) =>
          wallet.id !== this.editingWallet.id &&
          wallet.name === this.editWalletName
      )
    }
  }

  isDiabledSubmitButton(key) {
    if (key === "add") {
      return (
        !this.addWalletName ||
        this.addWalletName === "" ||
        !this.isValidName("add")
      )
    }
    if (key === "edit") {
      return (
        !this.editWalletName ||
        this.editWalletName === "" ||
        !this.isValidName("edit")
      )
    }
  }

  getDateTimeText(date) {
    const dateTime = new Date(date)
    return moment(dateTime).format("DD-MM-YYYY - HH:mm")
  }

  getWallets() {
    this.walletService.getWallets({ active: true }).subscribe(
      (response) => {
        this.wallets = response.data
      },
      (error) => {
        console.log("error ", error)
      }
    )
  }

  addWallet() {
    const body = {
      name: this.addWalletName,
    }
    this.walletService.addWallet(body).subscribe(
      (response) => {
        this.getWallets()
      },
      (error) => {
        console.log("error ", error)
      }
    )
    this.addWalletName = ""
    this.isDisplayAddModal = false
  }

  editWallet() {
    const body = {
      wallet_id: this.editingWallet.id,
      name: this.editWalletName,
      active: true,
    }
    this.walletService.updateWallet(body).subscribe(
      (response) => {
        this.getWallets()
      },
      (error) => {
        console.log("error ", error)
      }
    )
    this.editingWallet = undefined
    this.editWalletName = ""
    this.isDisplayEditModal = false
  }

  deleteWallet() {
    const body = {
      wallet_id: this.deletingWallet.id,
      name: this.deletingWallet.name,
      active: false,
    }
    this.walletService.updateWallet(body).subscribe(
      (response) => {
        this.getWallets()
      },
      (error) => {
        console.log("error ", error)
      }
    )
    this.deletingWallet = undefined
    this.isDisplayConfirmDeleteModal = false
  }
}
