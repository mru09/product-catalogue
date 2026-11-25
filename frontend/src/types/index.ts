export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  averageRating?: number;
}
export interface User {
  id: string;
  name: string;
  email: string;
}
export interface RatedProduct {
  product: Product;
  rating: number;
}
