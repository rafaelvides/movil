import { IPagination } from "../GlobalTypes/Global.types";
import {
  ICustomer,
  IPayloadCustomer,
} from "./customer.types";

export interface ICustomerStore {
  customer_list: ICustomer[];
  is_loading: boolean;
  customers: ICustomer[];
  customer_paginated: IPagination;
  getCustomersPagination: (
    page: number,
    limit: number,
    name: string,
    email: string,
  ) => void;
  OnGetCustomersList: () => void;
  PostCustomer: (payload: IPayloadCustomer) => Promise<boolean>;
  UpdateCustomer: (payload: IPayloadCustomer, id: number) => void;
  DeleteCustomer: (id: number) => void;
}
