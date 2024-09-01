import { get_branch_list } from "@/services/branch.service";
import { IBranchStore } from "@/types/branch/branch_store.types";
import { ToastAndroid } from "react-native";
import { create } from "zustand";

export const useBranchStore = create<IBranchStore>((set) => ({
  branches: [],

  OnGetBranchList() {
    get_branch_list()
      .then((data) => {
        set({ branches: data.data.branches });
      })
      .catch(() => {
        ToastAndroid.show("Error al obtener las sucursales", ToastAndroid.LONG);
        set({ branches: [] });
      });
  },
}));
