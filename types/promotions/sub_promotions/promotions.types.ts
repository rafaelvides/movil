export interface IGetPromotions {
  ok: boolean;
  message: string;
  promotions: Promotion[];
}

export interface Promotion {
  name: string;
  description: string;
  days: string;
  quantity: number;
  percentage: number;
  operator: string;
  fixedPrice: number;
  maximum: number;
  startDate: string | Date;
  endDate: string | Date;
  price: number;
  operatorPrice: string;
  state?: boolean;
  isActive?: boolean;
  priority: string;
  branchId: number;

}
export interface PromotionCategories {
  name: string;
  description: string;
  days: string;
  quantity: number;
  percentage: number;
  operator: string;
  fixedPrice: number;
  maximum: number;
  startDate: string | Date;
  endDate: string | Date;
  price: number;
  operatorPrice: string;
  state?: boolean;
  isActive?: boolean;
  priority: string;
  branchId: number;
  typePromotion: string;
  categories: CategoryProduct[];
}
export interface CategoryProduct {
  categoryId: number;
}

export interface PromotionPayload {
  name: string;
  description: string;
  days: string;
  quantity: number;
  percentage: number;
  operator: string;
  fixedPrice: number;
  maximum: number;
  startDate: string | Date;
  endDate: string | Date;
  price: number;
  operatorPrice: string;
  state?: boolean;
  isActive?: boolean;
  branchId: number;
  priority: string;
  // typePromotion: string;
}



export interface PromotionProduct {
  name: string;
  description: string;
  days: string;
  quantity: number;
  percentage: number;
  operator: string;
  fixedPrice: number;
  maximum: number;
  startDate: string | Date;
  endDate: string | Date;
  price: number;
  operatorPrice: string;
  state?: boolean;
  isActive?: boolean;
  priority: string;
  branchId: number;
  typePromotion: string;
  products: Products[];
}
export interface Products {
  productId: number;
}
