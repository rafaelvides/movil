import { get_employees_list } from "@/services/employee.service";
import { IEmployeeStore } from "@/types/employee/employee_store.types";
import { create } from "zustand";

export const useEmployeeStore = create<IEmployeeStore>((set) => ({
  is_loading: false,
  employee_list: [],

  OnGetEmployeesList: () => {
    set({ is_loading: true });
    get_employees_list().then((data) => {
      set({ is_loading: false, employee_list: data.data.employees });
    });
  },
}));
