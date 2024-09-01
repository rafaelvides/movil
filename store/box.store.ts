import { box_data, delete_box } from "@/plugins/async_storage";
import { close_box_by_id, save_box } from "@/services/box.service";
import { IBoxStore } from "@/types/store/box.store";
import { ToastAndroid } from "react-native";
import { create } from "zustand";

export const useBoxStore = create<IBoxStore>((set) => ({
  box_list: [],

  OnPostBox: async (box, token) => {
    await save_box(box, token)
      .then(({ data }) => {
        if (data) {
          box_data(data);
          ToastAndroid.show("Caja abierta", ToastAndroid.SHORT);
        }
      })
      .catch(() => {
        ToastAndroid.show("Error al guardar caja", ToastAndroid.SHORT);
      });
  },
  OnRemoveBox() {
    delete_box();
  },
  OnCloseBox(idBox) {
    close_box_by_id(idBox)
      .then(() => {
        delete_box();
        ToastAndroid.show("Caja cerrado con éxito", ToastAndroid.SHORT);
      })
      .catch(() => {
        ToastAndroid.show("Error al cerrar caja", ToastAndroid.SHORT);
      });
  },
}));
