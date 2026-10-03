import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-how-to-calculate",
  templateUrl: "./how-to-calculate.component.html",
  styleUrls: ["./how-to-calculate.component.scss"],
})
export class HowToCalculateComponent implements OnInit {
  constructor() {}

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
    	var result = "สินค้าหนัก";
    } else if (weight < shouldweight) {
    	var result = "สินค้าเบา";
    }
    else if (weight == shouldweight) {
    	var result = "-";
    }

    calResult.innerHTML = result;
     
  }
}
