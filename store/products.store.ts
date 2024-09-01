import { get_products_list } from "@/services/products.service";
import { IProductStore } from "@/types/branch_product/product/product.store.types";
import { ToastAndroid } from "react-native";
import { create } from "zustand";

export const useProductsStore = create<IProductStore>((set) => ({
  products: [],
  GetProductList: async () => {
    await get_products_list()
      .then(({ data }) => {
        set((state) => ({ ...state, products: data.products }));
      })
      .catch(() => {
        ToastAndroid.show("Error", ToastAndroid.SHORT);
        set((state) => ({
          ...state,
          products: [],
        }));
      });
  },
}));
