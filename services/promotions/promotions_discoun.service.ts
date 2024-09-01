import axios from "axios";
import { PromotionPayload } from "../../types/promotions/sub_promotions/promotions.types";
import { return_token } from "../../plugins/secure_store";
import { API_URL } from "../../utils/constants";
import { IGetPromotionsPaginated } from "../../types/promotions/promotions.types";

export const create_promotion_discount = (values: PromotionPayload) => {
  const token = return_token() ?? "";
  return axios.post<{ ok: boolean }>(API_URL + "/promotion-discounts", values, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const get_promotions = (
  page = 1,
  limit = 8,
  branchId: number,
  type: string,
  startDate: string,
  endDate: string
) => {
  const token = return_token() ?? "";
  return axios.get<IGetPromotionsPaginated>(
    API_URL +
      `/promotion-discounts/promos-paginated/${branchId}?page=${page}&limit=${limit}&type=${type}&startDate=${startDate}&endDate=${endDate}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
