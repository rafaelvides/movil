import { get_user } from "@/plugins/async_storage";
import { return_token } from "@/plugins/secure_store";
import { API_URL } from "@/utils/constants";
import axios from "axios";

export const get_branch_list = async () => {
  const user = await get_user();
  const token = await return_token();
  return axios.get(
    `${API_URL}/branches/list-by-transmitter/${user?.transmitterId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
