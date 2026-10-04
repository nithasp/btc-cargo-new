import { Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'faq' }],
})
export class FaqComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.borderLeftColorChange();
  }

  borderLeftColorChange():void {
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach((faqItem) => {
      faqItem.addEventListener("click",()=>{
        faqItems.forEach(items => items.classList.remove('active'));
        faqItem.classList.add('active');
      })
    });
  }

}
