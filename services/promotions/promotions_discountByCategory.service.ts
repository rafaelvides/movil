import axios from "axios";
import { return_token } from "../../plugins/secure_store";
import { API_URL } from "../../utils/constants";
import { PromotionPayloadByCategory } from "../../types/promotions/promotionsByCategory.types";

export const create_promotion_discount_by_category = (
  values: PromotionPayloadByCategory
) => {
  const token = return_token() ?? "";
  return axios.post<{ ok: boolean }>(
    API_URL + "/promotion-discounts/for-categories",
    values,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
