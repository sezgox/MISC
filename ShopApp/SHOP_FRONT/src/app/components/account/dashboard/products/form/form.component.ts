import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewProduct, Product } from '@interfaces/products.interfaces';
import { availableProducts, imgUrl } from 'src/app/core/consts/available-products';
import { Categories } from 'src/app/core/consts/categories.enum';

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
  @Input() action: string = 'add';

  imgUrl = imgUrl;
  availableCategories = Categories;

  availableProducts = availableProducts;
  selectedProduct: NewProduct | Product = this.availableProducts[0];

  categorySelected: string = "";

  add(){
    this.addProduct.emit(this.selectedProduct)
  }

  edit(){
    this.editProduct.emit(this.product);
  }

  onSelectProduct(event: any ){
    this.selectedProduct = availableProducts.find(product => product.name == event.target.value);
  }

  newRandomImage(){
    if(this.action == 'add'){
      this.selectedProduct.imgUrl = this.imgUrl(Math.floor(Math.random() * 1000));
    }else{
      this.product.imgUrl = this.imgUrl(Math.floor(Math.random() * 1000));
    }
  }

  removeCategory(cat: string, product: NewProduct | Product){
    product.categories = product.categories.filter(c => c != cat);
    console.log(this.selectedProduct)
  }

  addCategory(cat: string, product: NewProduct | Product){
    if(cat && !product.categories.includes(cat)){
      product.categories.push(cat);
    }

  }

}
