import { IBox } from "../box/box.types";
import { IBranchProduct } from "../branch_product/branch_product.types";
import { ICustomer } from "../customer/customer.types";
import { IEmployee } from "../employee/employee.types";
import { CF_CuerpoDocumentoItems, SVFC_CF_Firmado } from "../svf_dte/cf.types";
import { ISaleStatus } from "./sale_status/sale_status.types";

export interface ISale {
  id: number;
  box: IBox;
  boxId: number;
  customer: ICustomer;
  customerId: number;
  employee: IEmployee;
  employeeId: number;
  paymentType: string;
  salesStatus: ISaleStatus;
  salesStatusId: number;
  numeroControl: string;
  codigoGeneracion: string;
  tipoDte: string;
  fecEmi: string;
  horEmi: string;
  selloRecibido: string;
  selloInvalidacion: string;
  sello: boolean;
  codeEmployee: string;
  totalNoSuj: number;
  totalExenta: number;
  totalGravada: number;
  subTotalVentas: number;
  descuNoSuj: number;
  descuExenta: number;
  descuGravada: number;
  porcentajeDescuento: number;
  totalDescu: number;
  subTotal: number;
  totalIva: number;
  montoTotalOperacion: number;
  totalPagar: number;
  totalLetras: string;
  pathPdf: string;
  pathJson: string;
  isActivated: boolean;
}
export interface IGetSalesContingence {
  ok: boolean;
  sales: ISale[];
}

export interface IGetSalePagination {
  ok: boolean
  total: number
  sales: ISale[]
  totalPag: number
  currentPag: number
  nextPag: number
  prevPag: number
  status: number
}

export interface IDetails {
  id: number;
  // sale: ISale;
  saleId: number;
  branchProduct: IBranchProduct;
  branchProductId: number;
  montoDescu: number;
  ventaNoSuj: number;
  ventaExenta: number;
  ventaGravada: number;
  totalItem: number;
  cantidadItem: number;
  isActive: boolean;
}
export interface ISaleDetails {
  id: number;
  box: IBox;
  boxId: number;
  customer: ICustomer;
  customerId: number;
  employee: IEmployee;
  employeeId: number;
  paymentType: string;
  salesStatus: ISaleStatus;
  salesStatusId: number;
  numeroControl: string;
  codigoGeneracion: string;
  tipoDte: string;
  fecEmi: string;
  horEmi: Date;
  selloRecibido: string;
  selloInvalidacion: string;
  sello: boolean;
  codeEmployee: string;
  totalNoSuj: number;
  totalExenta: number;
  totalGravada: number;
  subTotalVentas: number;
  descuNoSuj: number;
  descuExenta: number;
  descuGravada: number;
  porcentajeDescuento: number;
  totalDescu: number;
  subTotal: number;
  totalIva: number;
  montoTotalOperacion: number;
  totalPagar: number;
  totalLetras: string;
  pathPdf: string;
  pathJson: string;
  isActivated: boolean;
  details: IDetails[];
}
export interface IGetSaleDetails {
  ok: boolean;
  sale: ISaleDetails;
  status: number;
}
export interface ISale_JSON_Debito extends SVFC_CF_Firmado {
  itemsCopy: CF_CuerpoDocumentoItems[],
  indexEdited: number[]
}