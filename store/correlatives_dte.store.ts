import { get_correlatives_dte } from "@/services/correlatives_dte.service";
import { ICorrelativesDteStore } from "@/types/corelatives/correlatives_dte.store.types";
import { create } from "zustand";

export const useCorrelativesDteStore = create<ICorrelativesDteStore>(() => ({
  async getCorrelativesByDte(transmitter_id, dte) {
    const result = await get_correlatives_dte(transmitter_id, dte);

    if (result) return result.data.correlativo;

    return undefined;
  },
}));
