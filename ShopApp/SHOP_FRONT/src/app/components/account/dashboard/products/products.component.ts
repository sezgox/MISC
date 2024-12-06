import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product, ProductQuery } from '@interfaces/products.interfaces';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  @Input() products: Product[] = [];
  @Input() maxPage: number;

  @Output() loadProducts: EventEmitter<ProductQuery> = new EventEmitter<ProductQuery>();
  @Output() addProduct: EventEmitter<void> = new EventEmitter();
  @Output() deleteProduct: EventEmitter<number> = new EventEmitter();


  query: ProductQuery = {
    page: 1,
    pageSize: 5,
  }

  ngOnInit(): void {

    const token = localStorage.getItem('AUTH_TOKEN');
    if(token){
      const tokenDecoded = jwtDecode(token);
      this.query.authorId = Number(tokenDecoded.sub);
    }
    this.loadProducts.emit(this.query);
  }

  loadMore(){
    this.query.page++;
    this.loadProducts.emit(this.query)
  }

  add(){
    this.addProduct.emit()
  }

  showDialog(id: number){
    const dialog = document.getElementById('dialog' + id) as HTMLDialogElement;
    dialog.showModal();
  }

  hideDialog(id: number){
    const dialog = document.getElementById('dialog' + id) as HTMLDialogElement;
    dialog.close();
  }

  delete(id: number){
    this.deleteProduct.emit(id);
    this.hideDialog(id);
/*     this.query.page = 1;
    this.loadProducts.emit(this.query); */
  }

}
