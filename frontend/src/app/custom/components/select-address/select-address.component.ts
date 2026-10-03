import {
  AfterViewInit,
  Component,
  Input,
  Output,
  EventEmitter,
} from "@angular/core"
import { addresses } from "../../../model/addresses"
declare var $: any

@Component({
  selector: "select-address",
  templateUrl: "./select-address.component.html",
  styleUrls: ["./select-address.component.scss"],
})
export class SelectAddressComponent implements AfterViewInit {
  readonly addresses = addresses
  @Input() id
  @Input() address
  @Output() addressSelected = new EventEmitter<string>()
  constructor() {}

  ngAfterViewInit(): void {
    const id = this.id
    const component = this
    $(`#${id}`).select2({
      placeholder: "เลือกที่อยู่",
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

    $(`#${id}`).on("select2:select", (e) => {
      component.selectedCallback(e.params.data.id);
      
    })

    if (this.address) {
      $(`#${id}`).val(this.address).trigger("change")
      component.selectedCallback(this.address);
    }
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
