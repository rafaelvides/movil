import { BranchProducts } from "../entity/branch_product.entity";
import { IPaginationOffline } from "./pagination.types";

export interface IGetBranchProductsOfflinePag extends IPaginationOffline {
  branchProducts: BranchProducts[];
}
export interface ICartProductOffline extends BranchProducts {
  quantity: number;
  discount: number;
  porcentaje: number;
  total: number;
  base_price: number;
}
