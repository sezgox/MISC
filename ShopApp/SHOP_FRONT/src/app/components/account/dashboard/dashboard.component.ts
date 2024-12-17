import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@components/shared/header/header.component';
import { NewProduct, Product, ProductQuery } from '@interfaces/products.interfaces';
import { User } from '@interfaces/user.interface';
import { ProductsService } from '@services/products.service';
import { UsersService } from '@services/users.service';
import { InformationComponent } from './information/information.component';
import { MenuComponent } from './menu/menu.component';
import { OrdersSalesComponent } from './orders-sales/orders-sales.component';
import { ProductsComponent } from './products/products.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, FormsModule, InformationComponent, ProductsComponent, MenuComponent, OrdersSalesComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  productsService = inject(ProductsService);
  usersService = inject(UsersService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  user: User | null;
  products: WritableSignal<Product[]> = signal<Product[]>([]);
  maxPage: number = 0;

  menuOption: string = "information";

  ngOnInit(): void {
    this.user = this.usersService.getCurrentUser();
  }

  getProducts(query: ProductQuery = {page: 1}) {
    this.productsService.getProducts(query).subscribe({
      next: (res) => {
          if(query.page == 1 ){
            this.products.set([]);
          }
          for (let product of res.products) {
            this.products().push(product);
          }
          this.maxPage = Math.ceil(res.totalProducts / query.pageSize);
        },
      error: (err) => {
        console.error(err);
      }
    });
  }

  addProduct(product: NewProduct) {
    console.log(product)
    this.productsService.addProduct(product).subscribe({
      next: (res) => {
          this.products().push(res);
          const popover = document.getElementById('popover') as HTMLDialogElement;
          popover.hidePopover();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  deleteProduct(id: number) {
    this.productsService.deleteProduct(id).subscribe({
      next: (res) => {
        console.log(res)
        this.getProducts();
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  onMenuChange(menuOption: string){
    this.menuOption = menuOption;
  }

  editProduct(product: Product) {
    this.productsService.editProduct(product).subscribe({
      next: (res) => {
        const popover = document.getElementById('popover') as HTMLDialogElement;
        popover.hidePopover();
        this.getProducts();
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

}
