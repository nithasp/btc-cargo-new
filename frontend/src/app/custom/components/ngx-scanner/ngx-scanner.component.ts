import { Component, OnInit } from '@angular/core';

@Component({
  selector: "app-ngx-scanner",
  templateUrl: "./ngx-scanner.component.html",
  styleUrls: ["./ngx-scanner.component.scss"],
})
export class NgxScannerComponent implements OnInit {

  scanResult: string;

  constructor() {}

  ngOnInit(): void {}

  onCodeResult(value:any) {
    console.log(value)
    alert(value);
    this.scanResult = value;
  }
}
