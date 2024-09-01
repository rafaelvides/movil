import { IAddress } from "../transmitter/address/address.types";
import {
  IContributorType,
  ITransmitter,
} from "../transmitter/transmiter.types";

export interface ISupplier {
  id: number;
  nombre: string;
  nombreComercial: string;
  nrc: string;
  nit: string;
  tipoDocumento: string;
  numDocumento: string;
  codActividad: string;
  descActividad: string;
  bienTitulo: string;
  telefono: string;
  correo: string;
  isActive: boolean;
  esContribuyente: boolean;
  tipoContribuyente: IContributorType;
  direccion: IAddress;
  direccionId: number;
  transmitter: ITransmitter;
  transmitterId: number;
}
