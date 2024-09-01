import axios from "axios";
import { API_URL } from "../utils/constants";
import {
  IPayloadCustomer,
  IGetCustomers,
  IGetCustomersPaginated,
} from "../types/customer/customer.types";
import { return_token } from "../plugins/secure_store";
import { get_user } from "@/plugins/async_storage";

export const get_customer_paginated = async (
  page: number,
  limit: number,
  name: string,
  email: string
) => {
  const token = await return_token();
  const user = await get_user();
  return axios.get<IGetCustomersPaginated>(
    API_URL +
      `/customers/list-paginated/${
        user?.transmitterId
      }?page=${page}&limit=${limit}&nombre=${name}&correo=${email}&active=${1}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const get_customer = async () => {
  const user = await get_user();
  const token = await return_token();
  return axios.get<IGetCustomers>(
    API_URL + `/customers/list-by-transmitter/${user?.transmitterId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const create_customer = async (payload: IPayloadCustomer) => {
  const token = await return_token();
  return axios.post<{ ok: boolean }>(API_URL + "/customers", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const update_customer = async (
  payload: IPayloadCustomer,
  id: number
) => {
  const token = await return_token();
  return axios.patch<{ ok: boolean }>(API_URL + "/customers/" + id, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const delete_customer = async (id: number) => {
  const token = await return_token();
  return axios.delete<{ ok: boolean }>(API_URL + "/customers/" + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
