import { IBranch } from "../branch/branch.types";
import { ISupplier } from "../supplier/supplier.types";
import { IProducts } from "./product/product.types";

export interface IBranchProduct {
  id: number;
  stock: number;   
  price: string;
  priceA: string;
  priceB: string;
  priceC: string;
  minimumStock: number;
  costoUnitario: string;
  branch: IBranch;
  branchId: number;
  product: IProducts;
  productId: number;
  supplier: ISupplier;
  supplierId: number;
  fixedPrice: string;
  days: string[];
  porcentaje: number;
  minimum: number;
  maximum?: any;
  isActive: boolean;
}
export interface IGetBranchProductPaginated {
  ok: boolean;
  branchProducts: IBranchProduct[];
  total: number;
  totalPag: number;
  currentPag: number;
  nextPag: number;
  prevPag: number;
  status: number;
}
export interface IGetBranchProductList {
  ok: boolean;
  branchProducts: IBranchProduct[];
  status: number;
}
export interface ICartProduct extends IBranchProduct {
  uuid: string;
  quantity: number;
  discount: number;
  porcentaje: number;
  total: number;
  base_price: number;
  fixed_price: number;
  monto_descuento: number;
  porcentaje_descuento: number;
  prices: string[];
}

export interface IGetBranchProductByCode {
  ok: boolean;
  message: string;
  product: IBranchProduct;
}
