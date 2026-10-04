import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
} from "@angular/core"
import { Subscription } from "rxjs"
import { addresses } from "../../../model/addresses"
import { TranslocoService } from "@ngneat/transloco"
declare var $: any

@Component({
  selector: "select-address",
  templateUrl: "./select-address.component.html",
  styleUrls: ["./select-address.component.scss"],
})
export class SelectAddressComponent implements AfterViewInit, OnDestroy {
  readonly addresses = addresses
  @Input() id
  @Input() address
  @Output() addressSelected = new EventEmitter<string>()
  private placeholderSubscription: Subscription
  constructor(private transloco: TranslocoService) {}

  ngAfterViewInit(): void {
    const id = this.id
    const component = this
    let initialized = false
    this.placeholderSubscription = this.transloco
      .selectTranslate("select_address")
      .subscribe((placeholder) => {
        this.initSelect2(placeholder)
        if (initialized) {
          return
        }
        initialized = true

        $(`#${id}`).on("select2:select", (e) => {
          component.selectedCallback(e.params.data.id);
        })

        if (this.address) {
          $(`#${id}`).val(this.address).trigger("change")
          component.selectedCallback(this.address);
        }
      })
  }

  ngOnDestroy(): void {
    this.placeholderSubscription.unsubscribe()
  }

  initSelect2(placeholder: string) {
    $(`#${this.id}`).select2({
      placeholder,
      multiple: false,
      data: this.getInitData(),
      ajax: {
        transport: (params, success) => {
          let pageSize = 10
          let page = params.data.page || 1
          let results = addresses
            .filter((i) => new RegExp(params.data.term, "i").test(i.text))
            .map((i) => {
              return { id: i.id, text: i.text }
            })

          let paged = results.slice((page - 1) * pageSize, page * pageSize)
          let options = {
            results: paged,
            pagination: {
              more: results.length >= page * pageSize,
            },
          }
          success(options)
        },
      },
    })
  }

  selectedCallback(id){
    this.addressSelected.emit(id)
  }

  getInitData() {
    if (this.address) {
      return addresses.filter((add) => add.id === this.address)
    }
  }
}
