import { create } from "zustand";
import {
  create_customer,
  delete_customer,
  get_customer,
  get_customer_paginated,
  update_customer,
} from "../services/customer.service";
import { ICustomerStore } from "../types/customer/customer_store.types";
import { ToastAndroid } from "react-native";
import { get_user } from "@/plugins/async_storage";
import { IPagination } from "@/types/GlobalTypes/Global.types";
export const useCustomerStore = create<ICustomerStore>((set, get) => ({
  customer_list: [],
  customer_paginated: {} as IPagination,
  is_loading: false,
  customers: [],
  getCustomersPagination: (page, limit, name, email) => {
    set({ is_loading: true });
    get_customer_paginated(page, limit, name, email)
      .then(({ data }) => {
        set({
          customers: data.customers,
          customer_paginated: {
            total: data.total,
            totalPag: data.totalPag,
            currentPag: data.currentPag,
            nextPag: data.nextPag,
            prevPag: data.prevPag,
            status: data.status,
            ok: data.ok,
          },
          is_loading: false,
        });
      })
      .catch((e) => {
        set({
          customers: [],
          customer_paginated: {
            total: 0,
            totalPag: 0,
            currentPag: 0,
            nextPag: 0,
            prevPag: 0,
            status: 404,
            ok: false,
          },
          is_loading: false,
        });
      });
  },
  OnGetCustomersList: async () => {
    set({ is_loading: true });
    await get_customer()
      .then(({ data }) => {
        set((state) => ({
          ...state,
          customer_list: data.customers,
          is_loading: false,
        }));
      })
      .catch(() => {
        set((state) => ({ ...state, customer_list: [], is_loading: false }));
      });
  },
  PostCustomer: async (payload) => {
    return await create_customer(payload)
      .then(({ data }) => {
        if (data) {
          get().getCustomersPagination(1, 5, "", "");
          ToastAndroid.show("Cliente creado", ToastAndroid.SHORT);

          return true;
        } else {
          return false;
        }
      })
      .catch(() => {
        ToastAndroid.show("Error", ToastAndroid.SHORT);
        return false;
      });
  },
  UpdateCustomer: async (id, payload) => {
    const user = await get_user();
    return await update_customer(id, payload)
      .then(({ data }) => {
        if (data) {
          get().getCustomersPagination(1, 5, "", "");
        } else {
          ToastAndroid.show("Error", ToastAndroid.SHORT);
        }
      })
      .catch(() => {
        ToastAndroid.show("Error", ToastAndroid.SHORT);
      });
  },
  DeleteCustomer: async (id) => {
    return await delete_customer(id)
      .then(({ data }) => {
        get().getCustomersPagination(1, 5, "", "");
        ToastAndroid.show("Cliente eliminado", ToastAndroid.SHORT);
        return data.ok;
      })
      .catch(() => {
        ToastAndroid.show("Error", ToastAndroid.SHORT);
      });
  },
}));
