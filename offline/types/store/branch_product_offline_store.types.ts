import { IBranchProductCreateDto } from "@/offline/dto/branch_product.dto";
import { BranchProducts } from "@/offline/entity/branch_product.entity";
import { IPaginationOffline } from "@/offline/types/pagination.types";
import { ICartProductOffline } from "../branch_product_offline";

export interface IBranchProductOfflineStore {
  branchProducts: BranchProducts[];
  is_loading: boolean;
  pagination: IPaginationOffline;
  cart_products: ICartProductOffline[];
  totalAPagar: number;
  totalIva: number;
  isDescuento: boolean;
  descuentoPorProducto: {
    descripcion: string;
    descuento: number;
  }[];
  descuentoTotal: number;
  descuent: number;
  porcentajeDescuento: {
    descripcion: string;
    descuento: number;
  }[];

  OnSaveBranchProduct: (payload: IBranchProductCreateDto) => Promise<boolean>;
  OnGetBranchProductsOffline: (
    branchId: number,
    code: string,
    name: string,
    page: number,
    limit: number
  ) => void;
  PostProductCart: (product: BranchProducts) => void;
  OnPlusQuantity: (id: number) => void;
  OnMinusQuantity: (id: number) => void;
  OnRemoveProduct: (id: number) => void;
  OnUpdateQuantity: (index: number, quantity: number) => void;
  deleteProductCart: (id: number) => void;
  emptyCart: () => void;
  OnAddProductForCode: (code: string) => void;
}
