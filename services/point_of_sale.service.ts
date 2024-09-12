import axios from "axios";
import { API_URL } from "@/utils/constants";
import { return_token } from "../plugins/async_storage";
import {
  IGetPointOfSales,
  IPointOfSaleReply,
} from "@/types/point_of_sales/pointOfSales.types";

export const get_find_by_correlative = async (id: number, dteType: string) => {
  const token = await return_token();
  return axios.get<IPointOfSaleReply>(
    `${API_URL}/point-of-sale/find-correlative/${id}?dteType=${dteType}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const get_point_of_sales_list = async (id: number) => {
  const token = await return_token();
  return axios.get<IGetPointOfSales>(`${API_URL}/point-of-sale/by-branch/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
