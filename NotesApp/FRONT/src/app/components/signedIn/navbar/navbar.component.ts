import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";
import { MenuService } from 'src/app/services/menu.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  animations: [
    trigger(
      'inOutAnimation', //NAME
      [
        transition(
          ':enter', //WHEN DIV IS BEING ADDED BY ngIf
          [
            style({ left: -500 }),
            animate('0.4s ease-out', 
                    style({ left: 0}))
          ]
        ),
        transition(
          ':leave', //WHEN DIV IS BEING REMOVED BY ngIf
          [
            style({ left: 0}),
            animate('0.4s ease-in', 
                    style({ left: -500 }))
          ]
        )
      ]
    )
  ]
})
export class NavbarComponent {

  username;

  button: string;

  constructor(private router: Router, public menuService: MenuService){

  }
  
  ngOnInit():void{
    this.menuService.showNav();
    this.menuService.isDesktop();
  }

  myProfile(){
    const decodedToken: any = jwtDecode(localStorage.getItem('AUTH_TOKEN'));
    this.username = decodedToken.username;
    this.router.navigate([`/profile/${this.username}`]);
  }

  logout(){
    localStorage.removeItem('AUTH_TOKEN');
    this.router.navigate(['/login']);
    this.menuService.showNav();
  }


  toggle(){
    this.menuService.toggle();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isInsideMenu = this.isInsideMenu(target);

/*      if (!isInsideMenu && this.hide) {
      console.log(target)
      this.showMenu();
    }  */
  }

  isInsideMenu(target: HTMLElement): boolean {
    // Verifica si el elemento clicado está dentro del menú
    const menuElement = document.querySelector('.menu');
    return menuElement && menuElement.contains(target);
  }

}
