import { Component, OnInit } from "@angular/core";
import QrScanner from "qr-scanner";

@Component({
  selector: "app-qr-scanner",
  templateUrl: "./qr-scanner.component.html",
  styleUrls: ["./qr-scanner.component.scss"],
})
export class QrScannerComponent implements OnInit {
  result: string = "None";
  files: File[] = [];

  constructor() {}

  ngOnInit(): void {}

  handleInput(): void {
    if (this.files.length === 0) {
      this.result = "Please upload your picture.";
      return;
    }

    QrScanner.WORKER_PATH = "./assets/qr/qr-scanner-worker.min.js";
    QrScanner.scanImage(this.files[0])
      .then((result) => {
        console.log(result);
        this.result = result;
      })
      .catch((error) => {
        console.log(error || "No QR code found.");
        this.result = error;
      });
  }

  onSelect(event: any) {
    this.files = [event.addedFiles[0]];
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }
}
