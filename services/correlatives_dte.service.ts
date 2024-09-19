import { IGetCorrelativesByTransmitter } from "@/types/corelatives/correlatives_dte.types";
import { API_URL } from "@/utils/constants";
import axios from "axios";
import { return_token } from "@/plugins/async_storage";


export const get_correlatives_dte = async (userId: number, tipo_dte: string) => {
    const token = await return_token();
    return axios.get<IGetCorrelativesByTransmitter>(
      `${API_URL}/point-of-sale/find-correlative/${userId}?dteType=${tipo_dte}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };