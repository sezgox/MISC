import { Component, Input } from '@angular/core';
import { ProductInfo } from '@interfaces/products.interfaces';

@Component({
  selector: 'app-product-ticket',
  standalone: true,
  imports: [],
  templateUrl: './product-ticket.component.html',
  styleUrl: './product-ticket.component.css'
})
export class ProductTicketComponent {

  @Input() product: ProductInfo;

}
