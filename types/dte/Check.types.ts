export interface ICheckPayload {
    nitEmisor: string;
    tdte: string;
    codigoGeneracion: string;
  }
  export interface ICheckResponse {
    version: number;
    ambiente: string;
    versionApp: number;
    estado?: string | null;
    codigoGeneracion?: string | null;
    selloRecibido?: null | string;
    fhProcesamiento: string;
    clasificaMsg?: any | null;
    codigoMsg: string;
    descripcionMsg: string;
    observaciones: string[];
  }
  