
export interface ProductQuery{
  category?: string;
  page?: number;
  pageSize?: number;
  onlyAvailable?: boolean;
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

export interface NewProduct {
  name: string;
  description: string;
  imgUrl: string;
  stock: number;
  price: number;
  categories: string[];
}

