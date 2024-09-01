import { create } from "zustand";
import { IClientOfflineStore } from "../types/store/customer_offline_store.types";
import {
  get_clients,
  getClientsPaginated,
  save_client,
} from "../service/customer.service";
import { ToastAndroid } from "react-native";
import { IPaginationOffline } from "@/offline/types/pagination.types";
import { AxiosError } from "axios";

export const useClientOfflineStore = create<IClientOfflineStore>((set) => ({
  loading_paginated: false,
  client_list_pagination: [],
  clientList: [],
  pagination: {} as IPaginationOffline,

  OnSaveClient: async (clients) => {
    const result = await save_client(clients)
      .then(() => {
        return true;
      })
      .catch((error: AxiosError) => {
        ToastAndroid.show(`Error: ${error.message}`, ToastAndroid.SHORT);
        return false;
      });

    return result;
  },
  OnGetClientsList() {
    get_clients()
      .then((data) => {
        set({ clientList: data });
      })
      .catch((error) => {
        ToastAndroid.show(`Error: ${error.message}`, ToastAndroid.SHORT);
        set({ clientList: [] });
      });
  },
  async OnGetClientsOfflinePagination(
    name,
    numDocumento,
    esContribuyente,
    page,
    limit
  ) {
    set({ loading_paginated: true });
    await getClientsPaginated(name, esContribuyente, numDocumento, page, limit)
      .then((data) => {
        set({
          client_list_pagination: data.clients,
          pagination: data,
          loading_paginated: false,
        });
      })
      .catch(() => {
        ToastAndroid.show(`No se encontraron resultados`, ToastAndroid.SHORT);
        set({
          client_list_pagination: [],
          pagination: {} as IPaginationOffline,
          loading_paginated: false,
        });
      });
  },
}));
