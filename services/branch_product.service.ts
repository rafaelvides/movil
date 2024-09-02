import { API_URL } from "@/utils/constants";
import axios from "axios";
import {
  IGetBranchProductPaginated,
  IGetBranchProductByCode,
  IGetBranchProductList,
} from "@/types/branch_product/branch_product.types";
import { return_token } from "../plugins/secure_store";
import { get_branch_id } from "@/plugins/async_storage";

export const get_branch_products = async (
  id: number,
  page: number,
  limit: number,
  name: string,
  code: string
) => {
  const token = await return_token();
   id = Number(await get_branch_id())
  return axios.get<IGetBranchProductPaginated>(
    `${API_URL}/branch-products/by-branch-paginated/${id}?page=${page}&limit=${limit}&name=${name}&code=${code}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const get_product_by_code = async (
  transmitterId: number,
  code: string
) => {
  const token = await return_token();
  return axios.get<IGetBranchProductByCode>(
    `${API_URL}/branch-products/get-code/${transmitterId}?code=${code}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const get_branch_product_by_branch = async (id: number) => {
  const token = await return_token();
  return axios.get<IGetBranchProductList>(
    `${API_URL}/branch-products/all-by-branch/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const get_discount_product_by_code = async (
  code: string,
  id: number
) => {
  const token = await return_token();
  return axios.get<IGetBranchProductByCode>(
    `${API_URL}/branch-products/get-code/${id}?code=${code}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
