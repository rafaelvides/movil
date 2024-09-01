import {
  API_FIRMADOR,
  AUTH_MH,
  CHECK_URL,
  MH_DTE,
  MH_URL,
} from "../utils/constants";
import axios, { CancelTokenSource } from "axios";
import { ICheckPayload, ICheckResponse } from "../types/dte/Check.types";
import { ISignInvalidationData } from "../types/dte/Invalidation.types";
import { SVFE_FC_SEND } from "../types/svf_dte/fc.types";
import { SVFE_CF_SEND } from "../types/svf_dte/cf.types";
import {
  IResponseJsonNotaDebito,
  SVFE_ND_SEND,
} from "../types/svf_dte/nd.types";
import { PayloadMH } from "@/types/dte/DTE.types";
import {
  ILoginMH,
  ResponseMHSuccess,
} from "@/types/svf_dte/responseMH/responseMH.types";
import qs from "qs";
import { IInvalidationToMH } from "@/types/svf_dte/invalidation.types";
import { SVFE_FSE_SEND } from "@/types/svf_dte/fse.types";
import { SVFE_NC_SEND } from "@/types/svf_dte/nc.types";
import {
  IContingencySales,
  ISendMHContingencia,
} from "@/types/svf_dte/ContingencySales.types";

export const send_to_mh = (
  payload: PayloadMH,
  token: string,
  cancelToken: CancelTokenSource
) => {
  return axios.post<ResponseMHSuccess>(MH_DTE, payload, {
    headers: {
      Authorization: token,
    },
    cancelToken: cancelToken.token,
  });
};
export const send_to_mh_invalidation = (
  payload: IInvalidationToMH,
  token: string
) => {
  return axios.post<ResponseMHSuccess>(`${MH_URL}anulardte`, payload, {
    headers: {
      Authorization: token,
    },
  });
};
export const firmarDocumentoFactura = (payload: SVFE_FC_SEND) => {
  return axios.post<{ body: string; status: string }>(API_FIRMADOR, payload);
};
export const firmarDocumentoFiscal = (payload: SVFE_CF_SEND) => {
  return axios.post<{ body: string, status: string }>(API_FIRMADOR, payload);
};
export const firmarDocumentoNotaDebito = (payload: SVFE_ND_SEND) => {
  return axios.post<{ body: string, status: string }>(API_FIRMADOR, payload);
};
export const firmarDocumentoInvalidacion = (payload: ISignInvalidationData) => {
  return axios.post<{ body: string }>(API_FIRMADOR, payload);
};
export const firmarNotaDebito = (
  payload: IResponseJsonNotaDebito | SVFE_ND_SEND
) => {
  return axios.post<{ body: string }>(API_FIRMADOR, payload);
};
export const login_mh = (user: string, password: string) => {
  return axios.post<ILoginMH>(AUTH_MH, qs.stringify({ user, pwd: password }), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};
export const firmarNotaCredito = (payload: SVFE_NC_SEND) => {
  return axios.post<{ body: string }>(API_FIRMADOR, payload);
};
export const firmarDocumentoContingencia = (payload: IContingencySales) => {
  return axios.post<{ body: string }>(API_FIRMADOR, payload);
};
export const firmarDocumentoFacturaSujetoExcluido = (
  payload: SVFE_FSE_SEND
) => {
  return axios.post<{ body: string }>(API_FIRMADOR, payload);
};
export const check_dte = (payload: ICheckPayload, token: string) => {
  return axios.post<ICheckResponse>(
    CHECK_URL,
    {
      ...payload,
    },
    {
      headers: {
        Authorization: token,
      },
    }
  );
};
export const send_to_mh_contingencia = (
  payload: ISendMHContingencia,
  token: string
) => {
  return axios.post<ResponseMHSuccess>(MH_URL + "contingencia", payload, {
    headers: {
      Authorization: token,
    },
  });
};
