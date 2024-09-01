import { Sale } from "@/offline/entity/sale.entity";
import { IPaginationOffline } from "@/offline/types/pagination.types";
import { IProcessSalesResponse } from "@/types/svf_dte/responseMH/responseMH.types";
import { IPointOfSales } from "@/types/point_of_sales/pointOfSales.types";

export interface ISalesOfflineStore {
  sales_offline_pag: Sale[];
  is_loading: boolean;
  pagination: IPaginationOffline;
  OnGetSalesOfflinePagination: (
    box_id: number,
    tipoDte: string,
    fecEmi: string,
    totalPagar: string,
    page: number,
    limit: number
  ) => void;
  OnPressAllSalesConting: (
    sale: Sale,
    codigoGeneracion: string,
    token_mh: string,
    idEmployee: number,
    correlatives: IPointOfSales,
    token: string
  ) => Promise<IProcessSalesResponse | undefined>;
}
