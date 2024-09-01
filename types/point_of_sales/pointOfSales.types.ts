import { IBranch } from "../branch/branch.types";

export interface IPointOfSales {
  id: number;
  code: string;
  typeVoucher: string;
  resolution: string;
  serie: string;
  from: string;
  to: string;
  prev: number;
  next: number;
  codPuntoVentaMH: string;
  codPuntoVenta: string;
  branch: IBranch;
  branchId: number;
  isActive: boolean;
  ///
  codEstableMH: string;
  codEstable: string;
  tipoEstablecimiento: string;

}
export interface IPointOfSaleCorrelatives extends IPointOfSales  {
  codEstableMH: string;
  codEstable: string;
  tipoEstablecimiento: string;
}
export interface IPointOfSaleReply {
  ok: boolean;
  correlativo: IPointOfSales;
  status: number
}
export interface IGetPointOfSales {
  ok: boolean;
  pointOfSales: IPointOfSales[];
  status: number;
}