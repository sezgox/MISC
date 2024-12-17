import { NewProduct } from '@interfaces/products.interfaces';
export function imgUrl(id:number) {
  return `https://picsum.photos/id/${id}/600/600`
}

export const availableProducts: NewProduct[] = [
  {
    name: 'Emeral Sword',
    description: 'A sword with a blade made of Emerald',
    imgUrl: imgUrl(1),
    stock: 10,
    price: 250,
    categories: ['Fashion']
  },
  {
    name: 'Solar-Powered Smartwatch with Gemstone Dial',
    description: 'A smartwatch with a dial made of Gemstone',
    imgUrl: imgUrl(2),
    stock: 5,
    price: 3000,
    categories: ['Fashion','Electronics','Jewelery']
  },
  {
    name: 'AI-Enhanced Skateboard',
    description: 'A skateboard with AI technology',
    imgUrl: imgUrl(3),
    stock: 2,
    price: 150,
    categories: ['Sports','Electronics','Motor']
  },
  {
    name: 'Everlasting Ink Makeup Pen',
    description: 'A makeup pen with Everlasting Ink',
    imgUrl: imgUrl(4),
    stock: 2000,
    price: 10,
    categories: ['Beauty','Others']
  },
] as const;
