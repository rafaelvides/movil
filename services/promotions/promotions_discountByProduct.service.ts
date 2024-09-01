import axios from "axios";
import { return_token } from "../../plugins/secure_store";
import { API_URL } from "../../utils/constants";
import { PromotionPayloadByProduct } from "../../types/promotions/promotionsByProduct.types";

export const create_promotion_discount_by_product = (
  values: PromotionPayloadByProduct
) => {
  const token = return_token() ?? "";
  return axios.post<{ ok: boolean }>(
    API_URL + "/promotion-discounts/for-products",
    values,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
