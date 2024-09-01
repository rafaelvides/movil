export interface IBranchProductCreateDto {
  id?: number;
  branchProductId: number;
  stock: number;
  price: string;
  priceA: string;
  priceB: string;
  priceC: string;
  minimumStock: number;
  branchId: number;
  supplierId: number;
  product: IProductsDto;
  productId: number;
  name: string;
  address: string;
  phone: string;
  transmitterId: number;
}
export interface IProductsDto {
  productId: number;
  name: string;
  description: string;
  code: string;
  nameCategory: string;
  tipoItem: number;
  uniMedida: number;
  isActive: boolean;
}
