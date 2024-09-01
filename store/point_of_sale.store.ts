import {
  get_find_by_correlative,
  get_point_of_sales_list,
} from "@/services/point_of_sale.service";
import { IPointOfSalesStore } from "@/types/point_of_sales/pointOfSales_store.types";
import { create } from "zustand";

export const usePointOfSaleStore = create<IPointOfSalesStore>((set) => ({
  is_loading: false,
  pointOfSales: [],

  OnGetPointOfSalesByBranch(id) {
    get_point_of_sales_list(id).then((data) => {
      set({ pointOfSales: data.data.pointOfSales });
    });
  },
  async OnGetCorrelativesByDte(transmitter_id, dte) {
    const result = await get_find_by_correlative(transmitter_id, dte);
    if (result) return result.data.correlativo;
  },
}));
