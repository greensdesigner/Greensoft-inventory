export interface User {
  id: string;
  email: string;
  businessName: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  businessName: string;
  fullName: string;
  phoneNumber: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
  minStock: number;
}

export interface Sale {
  id: string;
  date: string;
  customerName: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}
