import { IEmployeeCreateDto } from "@/offline/dto/employee.dto";
import { Employee } from "@/offline/entity/employee.entity";

export interface IEmployeeOfflineStore {
  employee_list: Employee[];
  OnSaveEmployee: (employee: IEmployeeCreateDto) => Promise<boolean>;
  OnGetEmployeesList: () => void;
}
