import { IConfiguration } from "../configuration/configuration.types";
import { IPagination } from "../GlobalTypes/Global.types";
import { IProcessSalesResponse } from "../svf_dte/responseMH/responseMH.types";
import { ITransmitter } from "../transmitter/transmiter.types";
import { ISale, ISaleDetails, ISale_JSON_Debito } from "./sale.types";

export interface SaleStore {
  pagination_sales: IPagination;
  is_loading: boolean;
  is_loading_details: boolean;
  sales: ISale[];
  recentSales: ISale[];
  contingence_sales: ISale[];
  sale_details: ISaleDetails | undefined;
  json_sale: ISale_JSON_Debito | undefined;
  img_invalidation: string | null;
  img_logo: string | null;
  GetPaginatedSales: (
    id: number,
    page: number,
    limit: number,
    startDate: string,
    endDate: string,
    status: number
  ) => void;
  GetRecentSales: (id: number) => void;
  GetSaleDetails: (id: number) => void;
  GetJsonSale: (path: string) => void;
  UpdateSaleDetails: (sale: ISale_JSON_Debito) => void;
  OnImgPDF: (extLogo: string) => void;
  OnPressAllSalesConting: (
    transmitter: ITransmitter,
    box_id: number,
    saleDTE: string,
    pathJso: string,
    token_mh: string,
    idEmployee: number,
    img_logo: string | null,
    img_invalidation: string | null,
    customer_id: number
  ) => Promise<IProcessSalesResponse | undefined>;
  onGetSalesContingence: (id: number) => void;
}
