import { get_user } from "@/plugins/async_storage";
import { return_token } from "@/plugins/secure_store";
import {
  GetByTransmitter,
  IGetTheme,
} from "@/types/configuration/configuration.types";
import { API_URL } from "@/utils/constants";
import axios from "axios";

export const get_by_transmitter = async (id: number) => {
  const token = await return_token();
  return axios.get<GetByTransmitter>(API_URL + `/personalization/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const get_theme_by_transmitter = async () => {
  const token = await return_token();
  const user = await get_user();
  return axios.get<IGetTheme>(
    `${API_URL}/personalization/theme/${user?.transmitterId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
