import { create } from "zustand";
import { ToastAndroid } from "react-native";
import { AxiosError } from "axios";
import { get_employees, save_employees } from "../service/employee.service";
import { IEmployeeOfflineStore } from "../types/store/employee_store.types";

export const useEmployeeStoreOffline = create<IEmployeeOfflineStore>(
  (set, get) => ({
    employee_list: [],

    OnSaveEmployee: async (employee) => {
      const result = await save_employees(employee)
        .then(() => {
          return true;
        })
        .catch(() => {
          ToastAndroid.show(
            `Error al guardar los empleados`,
            ToastAndroid.SHORT
          );
          return false;
        });
      return result;
    },
    OnGetEmployeesList() {
      get_employees()
        .then((data) => {
          set({ employee_list: data });
        })
        .catch((eror) => {
          ToastAndroid.show(
            `Error al cargar los empleados`,
            ToastAndroid.SHORT
          );
          set({ employee_list: [] });
        });
    },
  })
);
