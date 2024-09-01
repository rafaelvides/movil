import { return_token } from "@/plugins/secure_store";
import { IGetProductsList } from "@/types/branch_product/product/product.types";
import { API_URL } from "@/utils/constants";
import axios from "axios";

export const get_products_list = async () => {
  const token = await return_token();
  return axios.get<IGetProductsList>(API_URL + "/products/list", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
