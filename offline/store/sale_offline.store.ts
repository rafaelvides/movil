import { create } from "zustand";
import { IPaginationOffline } from "@/offline/types/pagination.types";
import {
  clear_complete_sale,
  get_sales_by_box,
} from "../service/sale_local.service";
import { ISalesOfflineStore } from "../types/store/sale_offline_store.types";
import {
  save_electronic_invoice,
  save_electronic_tax_credit,
} from "../service/realization_of_offline_sales.service";
import { IProcessSalesResponse } from "@/types/svf_dte/responseMH/responseMH.types";
import { usePointOfSaleStore } from "@/store/point_of_sale.store";

export const useSalesOfflineStore = create<ISalesOfflineStore>((set, get) => ({
  sales_offline_pag: [],
  is_loading: false,
  pagination: {} as IPaginationOffline,
  async OnGetSalesOfflinePagination(
    box_id,
    tipoDte,
    fecEmi,
    totalPagar,
    page,
    limit
  ) {
    set({ is_loading: true });
    await get_sales_by_box(box_id, tipoDte, fecEmi, totalPagar, page, limit)
      .then((data) => {
        set({
          sales_offline_pag: data.sales,
          pagination: data,
          is_loading: false,
        });
      })
      .catch(() => {
        set({
          sales_offline_pag: [],
          pagination: {} as IPaginationOffline,
          is_loading: false,
        });
      });
  },
  async OnPressAllSalesConting(
    sale,
    codigoGeneracion,
    token_mh,
    idEmployee,
    correlatives,
    token
  ) {
    if (sale) {
      if (sale.tipoDte === "01") {
        return save_electronic_invoice(
          sale,
          codigoGeneracion,
          token_mh,
          idEmployee,
          correlatives,
          token
        )
          .then(async (response) => {
            console.log("la respuesta", response);
            if (response.ok === true) {
              console.log("finbla");
              await clear_complete_sale(sale.id);
              return response;
            } else {
              return response;
            }
          })
          .catch((error: IProcessSalesResponse) => {
            console.log(error);
            return {
              ok: false,
              isErrorMh: false,
              title: error.title,
              message: error.message,
            };
          });
      } else if (sale.tipoDte === "03") {
        return save_electronic_tax_credit(
          sale,
          codigoGeneracion,
          token_mh,
          idEmployee,
          correlatives,
          token
        )
          .then(async (response) => {
            if (response!.ok === true) {
              return response;
            } else {
              return response;
            }
          })
          .catch((error: IProcessSalesResponse) => {
            return {
              ok: false,
              isErrorMh: false,
              title: error.title,
              message: error.message,
            };
          });
      }
    }
  },
}));
