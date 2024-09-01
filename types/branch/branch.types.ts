import { ITransmitter } from "../transmitter/transmiter.types";

export interface IBranch {
  id: number;
  name: string;
  address: string;
  phone: string;
  codEstableMH: string;
  codEstable: string;
  tipoEstablecimiento: string;
  isActive: boolean;
  transmitter: ITransmitter;
  transmitterId: number;
  location: boolean
}
