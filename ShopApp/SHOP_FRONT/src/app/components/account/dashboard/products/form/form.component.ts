import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewProduct, Product } from '@interfaces/products.interfaces';
import { availableProducts } from 'src/app/core/consts/available-products';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {

  @Output() addProduct: EventEmitter<NewProduct> = new EventEmitter<NewProduct>();
  @Output() editProduct: EventEmitter<Product> = new EventEmitter<Product>();

  @Input() product: Product;
  @Input() action: string = 'add'


  availableProducts = availableProducts;
  selectedProduct: NewProduct = availableProducts[0];


  add(){
    this.addProduct.emit(this.selectedProduct)
  }

  edit(){
    this.editProduct.emit(this.product);
  }

  onSelectProduct(event: any ){
    this.selectedProduct = availableProducts.find(product => product.name == event.target.value);
  }

}
