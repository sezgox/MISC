import { NgClass, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewProduct, Product, ProductQuery } from '@interfaces/products.interfaces';
import { FormComponent } from './form/form.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [NgStyle, FormsModule, NgClass, FormComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  @Input() products: Product[] = [];
  @Input() maxPage: number;

  @Output() loadProducts: EventEmitter<ProductQuery> = new EventEmitter<ProductQuery>();
  @Output() addProduct: EventEmitter<NewProduct> = new EventEmitter<NewProduct>();
  @Output() editProduct: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() deleteProduct: EventEmitter<number> = new EventEmitter();

  query: ProductQuery = {
    page: 1,
    pageSize: 5,
    onlyAvailable: false
  }

  action = 'add';
  productToEdit: Product;

  ngOnInit(): void {
    this.loadProducts.emit(this.query);
  }

  loadMore(){
    this.query.page++;
    this.loadProducts.emit(this.query)
  }

  add(event: NewProduct){
    this.addProduct.emit(event);
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
  }

  onEdit(product: Product){
    this.action = 'edit';
    this.productToEdit = product;
  }

  edit(product: Product){
    this.editProduct.emit(product);
  }

}
