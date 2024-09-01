import { ICategoryProduct } from "./category_product.types";

export interface ISubCategory {
    id: number;
  name: string;
  description: string;
  categoryProduct: ICategoryProduct;
  categoryProductId: number;
  isActive: boolean;
}