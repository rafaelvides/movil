import { IRole } from "@/types/role/role.types";

export interface ISendMHContingencia {
  nit: string;
  documento: string;
}
export interface ResponseMHSuccess {
  ambiente: string;
  clasificaMsg: string;
  codigoGeneracion: string;
  codigoMsg: string;
  descripcionMsg: string;
  estado: string;
  fhProcesamiento: string;
  observaciones: any[];
  selloRecibido: string;
  version: number;
  versionApp: number;
}
export interface IResponseInvalidationMH {
  version: number;
  ambiente: string;
  versionApp: number;
  estado: string;
  codigoGeneracion: string;
  selloRecibido: string | null;
  fhProcesamiento: string | null;
  clasificaMsg: null;
  codigoMsg: string;
  descripcionMsg: string;
  observaciones: string[];
}
export interface SendMHFailed {
  version: number;
  ambiente: string;
  versionApp: number;
  estado: string;
  codigoGeneracion: string;
  selloRecibido: any;
  fhProcesamiento: string;
  clasificaMsg: string;
  codigoMsg: string;
  descripcionMsg: string;
  observaciones: string[];
}
export interface Body {
  user: string;
  token: string;
  rol: IRole;
  roles: string[];
  tokenType: string;
}
export interface ILoginMH {
  status: string;
  body: Body;
}
export interface ILoginMHFailed {
  body: ILoginFailed;
  status: string;
}
export interface ILoginFailed {
  clasificaMsg: string;
  codigoMsg: string;
  descripcionMsg: string;
  estado: string;
  fhProcesamiento: string | null;
  observaciones: string[] | string | null;
}
// process sales offline
export interface IProcessSalesResponse{
  ok: boolean,
  isErrorMh: boolean,
  title: string
  message:string
}
export interface IProcessPDF {
  ok: boolean,
  message:string
}
export interface ErrorFirma {
  body: {
    codigo: string;
    mensaje: string;
  };
  status: string;
}