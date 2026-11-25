export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
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

export interface LoginResponse {
  token: string;
  user: User;
}
