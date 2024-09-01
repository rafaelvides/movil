import { Sale } from "../entity/sale.entity";
import { IPaginationOffline } from "./pagination.types";

export interface IGetSalesOfflinePag extends IPaginationOffline {
  sales: Sale[];
}
