import { IClientePayload } from "@/offline/dto/customer.dto";
import { Customer } from "@/offline/entity/customer.entity";
import { IPaginationOffline } from "@/offline/types/pagination.types";

export interface IClientOfflineStore {
  loading_paginated: boolean;
  client_list_pagination: Customer[];
  clientList: Customer[];
  pagination: IPaginationOffline;
  OnGetClientsOfflinePagination: (
    name: string,
    numDocumento: string,
    esContribuyente: boolean,
    page: number,
    limit: number
  ) => void;
  OnSaveClient: (client: IClientePayload) => Promise<boolean>;
  OnGetClientsList: () => void;
}
