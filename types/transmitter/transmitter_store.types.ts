import { ITransmitter } from '../../types/transmitter/transmiter.types';

export interface transmitterStore {
  transmitter: ITransmitter;
  OnGetTransmitter: () => void;
  getTransmitter: (id: number) => void;
}
