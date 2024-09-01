import { IRole } from "../role/role.types";
import { IPointOfSales } from "../point_of_sales/pointOfSales.types";
import { IBranch } from "../branch/branch.types";
export interface IUser {
  id: number;
  userName: string;
  password: string;
  role: IRole;
  roleId: number;
  pointOfSale: IPointOfSales;
  pointOfSaleId: number;
  active: boolean;
}
export interface UserLogin extends IUser {
  transmitterId: number;
  branchId: number;
}
