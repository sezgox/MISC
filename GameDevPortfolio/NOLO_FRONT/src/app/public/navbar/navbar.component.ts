import { ViewportScroller } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports:[RouterLink]
})
export class NavbarComponent{


  
  router = inject(Router);
  scroller = inject(ViewportScroller);
  
  goTo = output<string>();
  
  hasScrolledPastWindowHeight: boolean = false;


  scrollTo(event:any){
    event.preventDefault();
    const id = event.target.tagName.toLowerCase() == 'img' ? 'poster' : event.target.attributes['href'].value;

    const route = this.router.url.split('/').pop();
    if(id == 'contact'){
        const section = document.getElementById(id);
        const offsetTop = section!.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo( {top: offsetTop,
        behavior: 'smooth'});
      return
    }
    if(route?.includes('portfolio')){
      this.router.navigate(['/portfolio'],{fragment: id}).then(() => {
        this.goTo.emit(id)
      })
    }else{
      this.router.navigate(['/portfolio'],{fragment: id})
    }
  }

}
