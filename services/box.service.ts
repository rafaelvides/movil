import { return_token } from "@/plugins/async_storage";
import {
  IBoxPayload,
  ICloseBox,
  IGetBox,
  IGetBoxDetail,
  IReplySave,
} from "@/types/box/box.types";
import { API_URL } from "@/utils/constants";
import { formatDate } from "@/utils/date";
import axios from "axios";

export const save_box = (payload: IBoxPayload, tokenC: string) => {
  const token = return_token();
  return axios.post<IReplySave>(`${API_URL}/box`, payload, {
    headers: {
      Authorization: `Bearer ${!token ? token : tokenC}`,
    },
  });
};

export const verify_box = async (id: number) => {
  const token = await return_token();
  return await axios.get<IGetBox>(
    `${API_URL}/box/verify-by-pos/${id}?startDate=${formatDate()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const save_detail_close_box = async (
  closeBox: ICloseBox,
  idBox: number
) => {
  const token = await return_token();
  return axios.post<IGetBoxDetail>(
    `${API_URL}/detail-box/save-detail/${idBox}`,
    closeBox,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const close_box_by_id = async (idBox: number) => {
  const token = await return_token();
  return axios.delete<{ ok: boolean; message: string; status: number }>(
    API_URL + `/box/close-box/` + idBox,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
