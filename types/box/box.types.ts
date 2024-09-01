import { IPointOfSales } from "../point_of_sales/pointOfSales.types";

export interface IBox {
  id: number;
  start: number;
  end: number;
  totalSales: number;
  totalExpense: number;
  totalIva: number;
  date: Date;
  time: Date;
  isActive?: boolean;
  pointOfSale?: IPointOfSales;
  pointOfSaleId: number;
}

export interface IGetBoxList {
  ok: boolean;
  message: string;
  boxes: IBox;
}

export interface IBoxPayload {
  start: number;
  pointOfSaleId?: number;
}
export interface IGetBox {
  ok: boolean;
  message: string;
  box: IBox;
}

export interface ICloseBox {
  state: string;
  fiftyCents: number;
  fiftyDollars: number;
  fiveCents: number;
  fiveDollars: number;
  hundredDollars?: number;
  oneCents: number;
  oneDollar: number;
  oneDollarCents: number;
  tenCents: number;
  tenDollars: number;
  twentyDollars: number;
  twentyFiveCents: number;
  twoDollars: number;
}

export interface DetailBox {
  id: number;
  oneDollar: number;
  twoDollars: number;
  fiveDollars: number;
  tenDollars: number;
  twentyDollars: number;
  fiftyDollars: number;
  hundredDollars: number;
  oneCents: number;
  fiveCents: number;
  tenCents: number;
  twentyFiveCents: number;
  fiftyCents: number;
  oneDollarCents: number;
  box: IBox;
  boxId: number;
  isActive?: boolean;
}

export interface IGetBoxDetail {
  ok: boolean;
  detailBox: DetailBox;
  totalExpenses: number;
  totalSales: number;
  boxStart: string;
  totalBox: number;
  totalMoney: number;
  cost: number;
  boxEnd: number;
}
export interface IReplySave {
  ok: true;
  message: string;
  id: number;
  pointOfSaleId: number;
  start: number;
  time: Date;
  date: Date;
  end: number;
  totalSales: number;
  totalExpense: number;
  totalIva: number;
  isActive: true;
}
