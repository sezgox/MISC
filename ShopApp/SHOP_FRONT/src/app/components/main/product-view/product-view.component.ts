import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '@components/shared/header/header.component';
import { Product } from '@interfaces/products.interfaces';
import { User } from '@interfaces/user.interface';
import { CartService } from '@services/cart.service';
import { ProductsService } from '@services/products.service';
import { UsersService } from '@services/users.service';
import { AccountType } from 'src/app/core/consts/user-role.enum';

@Component({
  selector: 'app-product-view',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './product-view.component.html',
  styleUrl: './product-view.component.css'
})
export class ProductViewComponent implements OnInit {

  productsService = inject(ProductsService);
  usersService = inject(UsersService);
  cartService = inject(CartService);
  route = inject(ActivatedRoute);

  id: number = 0;
  product: Product = null;
  accountTypes = AccountType;
  user: User = null;
  loading: boolean = true;


  ngOnInit(): void {
    this.user = this.usersService.getCurrentUser();
    this.route.params.subscribe((params: any) => {
        this.id = Number(params['id']);
        this.getProduct(this.id);
    });
  }

  getProduct(id: number){
    this.productsService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res;
        this.loading = false
      },
      error: (err) => {
        this.loading = false
        console.error(err);
      }
    })
  }

  addToCart(){
    this.cartService.addProduct(this.product, this.user.id);
  }

}
