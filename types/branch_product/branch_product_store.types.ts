import { IPagination } from "../GlobalTypes/Global.types";
import { IBranchProduct, ICartProduct } from "./branch_product.types";

export interface IBranchProductStore {
  pagination_branch_product: IPagination;
  cart_products: ICartProduct[];
  branch_products: IBranchProduct[];
  is_loading: boolean;
  totalAPagar: number;
  totalIva: number;
  reteRenta: number;
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
  branch_products_list: IBranchProduct[];
  is_loading_list: boolean;
  PostProductCart: (product: IBranchProduct) => void;
  GetPaginatedBranchProducts: (
    brachId: number,
    page: number,
    limit: number,
    name: string,
    code: string
  ) => void;
  GetProductByCode: (transmitterId: number, code: string) => void;
  OnPlusQuantity: (uuid: string) => void;
  OnMinusQuantity: (uuid: string) => void;
  OnRemoveProduct: (uuid: string) => void;
  OnUpdateQuantity: (uuid: string, quantity: number) => void;
  OnUpdatePrice: (index: number, price: number) => void;
  deleteProductCart: (id: number) => void;
  emptyCart: () => void;
  // GetTotalsSales: () => number;
  OnGetBranchProductList: (brachId: number) => void;
  OnAddProductByCode: (code: string, id: number) => void;
}
