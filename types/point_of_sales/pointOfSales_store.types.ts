import { IPointOfSaleCorrelatives, IPointOfSales } from "./pointOfSales.types";

export interface IPointOfSalesStore {
  is_loading: boolean;
  pointOfSales: IPointOfSales[];

  OnGetCorrelativesByDte: (
    transmitter_id: number,
    dte: string
  ) => Promise<IPointOfSales | undefined>;
  OnGetPointOfSalesByBranch: (id: number) => void;
}
