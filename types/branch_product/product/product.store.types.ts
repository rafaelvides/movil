import { IProduct } from "./product.types";

export interface IProductStore {
    products : IProduct[]
    GetProductList: () => void
}