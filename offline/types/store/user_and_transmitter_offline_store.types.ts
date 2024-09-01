import { Transmitter } from "@/offline/entity/transmitter.entity";

export interface IUserAndTransmitterOfflineStore {
  transmitter: Transmitter;

  OnGetTransmitter: () => void;
}
