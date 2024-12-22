import { Injectable } from '@angular/core';
import { UserCart } from '@interfaces/cart.interfaces';
import { Product, ProductInfo } from '@interfaces/products.interfaces';
import { localStorageKeys } from '../consts/local-storage';



@Injectable({
  providedIn: 'root'
})
export class CartService {


  constructor() { }

  getCarts(): UserCart[]{
    const carts = JSON.parse(localStorage.getItem(localStorageKeys.CART));
    if(!carts){
      localStorage.setItem(localStorageKeys.CART, JSON.stringify([]));
      return this.getCarts();
    }else{
      return carts;
    }
  }

  getUserCart(userId: number): UserCart{
    const carts = this.getCarts();
    const userCart = carts.find(cart => cart.userId == userId);
    if(!userCart){
      return {userId, products: [] as ProductInfo[]};
    }else{
      return userCart;
    }
  }

  addProduct(product: Product, userId: number){
    const carts = this.getCarts();
    const productInfo = {...product,quantity:1,total: product.price};
    const userCart = this.getUserCart(userId);
    const productExists = userCart.products.find(product => product.id == product.id);
    if(productExists){
      const index = userCart.products.findIndex(product => product.id == product.id);
      userCart.products[index].quantity++;
      userCart.products[index].total = product.price * userCart.products[index].quantity;
      carts[carts.findIndex(cart => cart.userId == userId)] = userCart;
    }else{
      userCart.products.push(productInfo);
      carts.push(userCart);
    }
    localStorage.setItem(localStorageKeys.CART, JSON.stringify(carts));
  }

  clearCart(userId: number){
    const carts = this.getCarts();
    const index = carts.findIndex(cart => cart.userId == userId);
    carts[index] = {userId, products: [] as ProductInfo[]};
    localStorage.setItem(localStorageKeys.CART, JSON.stringify(carts));
  }

}
