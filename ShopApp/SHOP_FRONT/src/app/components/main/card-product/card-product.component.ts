import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Product } from './../../../core/interfaces/products.interfaces';

@Component({
  selector: 'app-card-product',
  standalone: true,
  imports: [NgClass],
  templateUrl: './card-product.component.html',
  styleUrl: './card-product.component.css'
})
export class CardProductComponent {
  @Input() product: Product;

}