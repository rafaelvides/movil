import { return_token } from "@/plugins/async_storage";
import {
  IGetLocationsRouteBranchResponse,
  IGetLocationsTimeReal,
  IPayloadLocation,
} from "@/types/location/locations.types";
import { API_URL } from "@/utils/constants";
import { formatDate } from "@/utils/date";
import axios from "axios";

export const save_location = async(payload: IPayloadLocation) => {
  const token = await return_token();
  return axios.post(`${API_URL}/coordinate`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const get_locations_real_time = async (id: number) => {
  const token = await return_token();
  return axios.get<IGetLocationsTimeReal>(
    `${API_URL}/coordinate-detail/last/${id}?date=${formatDate()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const get_locations_route_branch = async (id: number, date: string) => {
  const token = await return_token();
  return axios.get<IGetLocationsRouteBranchResponse>(
    `${API_URL}/coordinate/by-branch/${id}?date=${date}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const update_active_location = async (id: number, status: boolean) => {
  const token = return_token();
  return axios.patch<{ ok: boolean; message: string }>(
    `${API_URL}change-location/disable/${id}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
