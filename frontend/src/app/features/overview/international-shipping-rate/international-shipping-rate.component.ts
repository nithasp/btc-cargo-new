import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/shared/services/api.service';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-international-shipping-rate',
  templateUrl: './international-shipping-rate.component.html',
  styleUrls: ['./international-shipping-rate.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'overview' }],
})
export class InternationalShippingRateComponent implements OnInit {

  remarkKey: string = "international_shipping_rate"

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
