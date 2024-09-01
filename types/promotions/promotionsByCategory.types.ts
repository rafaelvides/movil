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
  typePromotion: string;
}

export interface PromotionPayloadByCategory {
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
  typePromotion: string;
  categories: CategoryProduct[];
}
export interface CategoryProduct {
  categoryId: number;
}
