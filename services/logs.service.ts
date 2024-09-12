import axios from "axios";
import { IGetLogByNumber, Logs } from "../types/log/logs.types";
import { API_URL } from "../utils/constants";
import { return_token } from "@/plugins/async_storage";

export const save_logs = (logs: Logs) => {
  const token = return_token();
  return axios.post(`${API_URL}/logs`, logs, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const get_logs = (code: string) => {
  const token = return_token();
  return axios.get<IGetLogByNumber>(
    `${API_URL}/logs/by-control-number?generationCode=${code}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
