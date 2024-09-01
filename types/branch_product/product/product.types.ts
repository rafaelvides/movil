import { ISubCategory } from "../categoryProduct/sub_category.types";

export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  code: string;
  costoUnitario: string;
  type: string;
  minimumStock: number;
  isActive: boolean;
  subCategoryProduct: ISubCategory;
  subCategoryProductId: number;
  tipoDeItem: string;
  tipoItem: string;
  uniMedida: string;
  unidaDeMedida: string;
}
export interface IProducts {
  id: number;
  name: string;
  tipoItem: string;
  tipoDeItem: string;
  description: string;
  unidaDeMedida: string;
  uniMedida: string;
  price: string;
  code: string;
  isActive: boolean;
  subCategoryProduct: ISubCategory;
  subCategoryProductId: number;
}

export interface IGetProductsList {
  ok: boolean;
  products: IProduct[];
  status: number;
}
