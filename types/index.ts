// types/index.ts
export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: 'active' | 'inactive';
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface ApiError {
  data?: {
    message?: string;
  };
  status?: number;
}