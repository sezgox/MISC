import { NgClass, NgStyle } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-flip-card',
  standalone: true,
  imports: [NgStyle,NgClass],
  templateUrl: './flip-card.component.html',
  styleUrl: './flip-card.component.css'
})
export class FlipCardComponent{

  @ViewChild('klk') klk!:ElementRef;

  @Input()
  specialization: {text:string,image:string} = {text:'',image:''};
  @Input()
  example:boolean = false;
  
  animationDone: boolean = false;

  flipped: boolean = false;

  @HostListener('window:scroll', [])
    onWindowScroll(): void {
      const scrollY = window.scrollY;
      const positionTrigger = this.klk.nativeElement.offsetTop - window.innerHeight * 0.9;
      if(!this.animationDone && scrollY > positionTrigger ){
        this.animationDone = true;
      }
    }

    flip(){
      this.flipped = !this.flipped
      console.log(this.flipped)
    }

}
