import { create } from "zustand";
import { ToastAndroid } from "react-native";
import { AxiosError } from "axios";
import { save_employees } from "../service/employee.service";
import { IEmployeeOfflineStore } from "../types/store/employee_store.types";

export const useEmployeeStoreOffline = create<IEmployeeOfflineStore>((set, get) => ({
  employee_list: [],

  OnSaveEmployee: async (employee) => {
    const result = await save_employees(employee)
      .then(() => {
        return true;
      })
      .catch((error: AxiosError) => {
        ToastAndroid.show(`Error: ${error.message}`, ToastAndroid.SHORT);
        return false;
      });
    return result;
  },
  OnGetEmployeesList() {},
}));
