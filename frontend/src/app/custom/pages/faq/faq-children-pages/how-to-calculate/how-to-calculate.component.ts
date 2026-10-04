import { Component, OnInit } from "@angular/core";
import { TRANSLOCO_SCOPE, TranslocoService } from "@ngneat/transloco";

@Component({
  selector: "app-how-to-calculate",
  templateUrl: "./how-to-calculate.component.html",
  styleUrls: ["./how-to-calculate.component.scss"],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: "faq" }],
})
export class HowToCalculateComponent implements OnInit {
  constructor(private transloco: TranslocoService) {}

  ngOnInit(): void {}

  cal() {
    var width = Number(
      (<HTMLInputElement>document.getElementById("width")).value
    );
    var long = Number(
      (<HTMLInputElement>document.getElementById("long")).value
    );
    var height = Number(
      (<HTMLInputElement>document.getElementById("height")).value
    );
    var weight = Number(
      (<HTMLInputElement>document.getElementById("weight")).value
    );
    var cubic: any = Number((width * long * height) / 1000000).toFixed(4);
    var shouldweight = cubic * 200;
    var cubicElem: any = document.getElementById("cubic");
    var shouldweightElem: any = document.getElementById("shouldweight");
    var calResult: any = document.getElementById("cal-result");

    cubicElem.value = cubic;
    shouldweightElem.value = shouldweight.toFixed(2);

    if (weight > shouldweight) {
    	var result = this.transloco.translate<string>("heavy_goods", {}, "faq");
    } else if (weight < shouldweight) {
    	var result = this.transloco.translate<string>("light_goods", {}, "faq");
    }
    else if (weight == shouldweight) {
    	var result = "-";
    }

    calResult.innerHTML = result;
     
  }
}
