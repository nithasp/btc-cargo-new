import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
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
