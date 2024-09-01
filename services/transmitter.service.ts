import { get_user } from "@/plugins/async_storage";
import { return_token } from "@/plugins/secure_store";
import { IGetTransmitter } from "@/types/transmitter/transmiter.types";
import { API_URL } from "@/utils/constants";
import axios from "axios";

export const get_transmitterId = async () => {
  const token = await return_token();
  const user = await get_user();
  return axios.get<IGetTransmitter>(
    API_URL + `/transmitter/${user?.transmitterId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      }, 
    }
  );
};
export const get_transmitter = async (id: number, token_send = "") => {
  const token = await return_token();
  return axios.get<IGetTransmitter>(API_URL + `/transmitter/${id}`, {
    headers: {
      Authorization: `Bearer ${token === "" || !token ? token_send : token}`,
    },
  });
};
