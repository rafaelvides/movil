import { IBranch } from "../branch/branch.types";

export interface IEmployee {
  id: number;
  fullName: string;
  phone: string;
  branch: IBranch;
  branchId: number;
  typeDocument: string;
  numDocument: string;
  isActive: boolean;
}
export interface IGetEmployeesList {
  employees: IEmployee[];
  ok: boolean;
  status: number;
}
