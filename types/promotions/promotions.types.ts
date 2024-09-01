export interface IGetPromotionsPaginated {
  ok: boolean;
  promotionsDiscount: PromotionDiscount[];
  total: number;
  totalPag: number;
  currentPag: number;
  nextPag: number;
  prevPag: number;
  status: number;
}

export interface PromotionDiscount {
  id: number;
  name: string;
  description: string;
  days: string;
  quantity: number;
  percentage: string;
  operator: string;
  fixedPrice: string;
  maximum: number;
  startDate: string;
  endDate: string;
  price: number;
  operatorPrice: string;
  typePromotion: string;
  state: true;
  isActive: true;
  priority: string;
  branch: {
    id: number;
    name: string;
    address: string;
    phone: string;
    isActive: boolean;
    transmitterId: number;
  };
  branchId: number;
}
