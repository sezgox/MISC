export interface ProductQuery{
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  imgUrl: string;
  stock: number;
  price: number;
  categories: string[];
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}
