import { Product } from "./products.interfaces";

export interface Order extends CreateOrder{
  id: number;
  date: string;
}

export interface CreateOrder{
  authorId: number;
  total: number;
  sales: Sale[];
}

export interface Sale {
  orderId?: number;
  productId: number;
  sellerId: number;
  total: number;
  quantity: number;
  product?: Product;
}
