export interface ProductEditDto {
  name?: string;
  code?: string;
  description?: string;
  price?: number;
  unitOfMeasure?: number;
  tipoItem?: number;
  unidadId?: number;
}

export interface ProductCreateDto {
  unitProductId: number;
  preci: number;
  idUnitProduct: number;
  name: string;
  code: string;
  description?: string;
  precio: number;
  quantity: number;
  unitOfMeasure: number;
  nameunitmeasure: string;
  unitprice: number;
  tipoItem: number;
  unidadId: number;
  isActive?: boolean;
}

export interface ProductFindOneDto {
  id: number;
}

export interface ProductFindByCodeDto {
  code: string;
}

export interface ProductDeleteDto {
  id: number;
}
