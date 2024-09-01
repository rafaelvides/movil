import { IAddress } from "./address/address.types";

export interface ITransmitter {
  id: number;
  clavePrivada: string;
  clavePublica: string;
  claveApi: string;
  nit: string;
  nrc: string;
  nombre: string;
  telefono: string;
  correo: string;
  descActividad: string;
  codActividad: string;
  nombreComercial: string;
  // tipoEstablecimiento: string;
  // codEstableMH: string;
  // codEstable: string;
  // codPuntoVentaMH: string;
  // codPuntoVenta: string;
  tipoContribuyente: IContributorType;
  direccion: IAddress;
  direccionId: number;
  active?: boolean;
}
export interface IGetTransmitter {
  ok: boolean;
  transmitter: ITransmitter;
  status: number;
}
export interface IContributorType {
  MajorContributor: string;
  MediumContributor: string;
  NA: string;
}
