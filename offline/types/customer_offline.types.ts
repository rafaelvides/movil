import { Customer } from "../entity/customer.entity";
import { IPaginationOffline } from "./pagination.types";

export interface IGetClientsOfflinePaginated extends IPaginationOffline {
  clients: Customer[];
}
