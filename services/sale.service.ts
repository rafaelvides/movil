import { API_URL } from "@/utils/constants";
import axios from "axios";
import { IGetSaleDetails, IGetSalePagination } from "@/types/sale/sale.types";
import { return_token } from "../plugins/secure_store";
import { IRessponseInvalidation } from "@/types/svf_dte/invalidation.types";
export const get_paginated_sales = async (
  id: number,
  page: number,
  limit: number,
  startDate: string,
  endDate: string,
  status: number
) => {
  const token = await return_token();
  return axios.get<IGetSalePagination>(
    `${API_URL}/sales/by-status/${id}?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&status=${status}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const get_recent_sales = async (id: number) => {
  const token = await return_token();
  return axios.get(`${API_URL}/sales/get-recents/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const invalidation_of_sales = async (
  id: number,
  selloInvalidacion: string
) => {
  const token = await return_token();
  return axios.patch<IRessponseInvalidation>(
    `${API_URL}/sales/invalidate/${id}`,
    { selloInvalidacion },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const get_details_sales = async (id: number) => {
  const token = await return_token();
  return axios.get<IGetSaleDetails>(`${API_URL}/sales/sale-details/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
