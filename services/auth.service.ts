import axios from "axios";
import { ILoginPayload, IAuthResponse } from "../types/auth/auth.types";
import { API_URL } from "../utils/constants";

export const make_login = async (payload: ILoginPayload) => {
  return axios.post<IAuthResponse>(`${API_URL}/auth`, payload);
};