import { IEmployee } from "./employee.types";

export interface IEmployeeStore {
  employee_list: IEmployee[];
  is_loading: boolean;
  
  OnGetEmployeesList: () => void;
}
