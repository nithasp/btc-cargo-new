import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/custom/services';

@Component({
  selector: 'app-warehouse-address',
  templateUrl: './warehouse-address.component.html',
  styleUrls: ['./warehouse-address.component.scss']
})
export class WarehouseAddressComponent implements OnInit {
  remarkKey: string = "warehouse_address_remark"

  remarkHTML: string

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.getHtmlContent(this.remarkKey).subscribe(
      (response) => {
        this.remarkHTML = response.data.html
      }
    ),
    (error) => {
      console.log("error ", error)
    }
  }

}
