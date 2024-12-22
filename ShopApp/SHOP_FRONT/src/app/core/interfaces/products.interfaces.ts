
export interface ProductQuery{
  category?: string;
  page?: number;
  pageSize?: number;
  onlyAvailable?: boolean;
}

export interface NewProduct {
  name: string;
  description: string;
  imgUrl: string;
  stock: number;
  price: number;
  categories: string[];
}

export interface Product extends NewProduct{
  id: number;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInfo {
  quantity: number;
  total: number;
  id: number;
  name: string;
  price: number;
  imgUrl: string;
  authorId: number;
}
