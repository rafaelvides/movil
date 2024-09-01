import { Coordenada } from "@/utils/filters";
import { IAddressLocations } from "./locations.types";

export interface ILocationStore {
  has_enabled: boolean;
  coordinatesRealTime: Coordenada;
  coordinatesRouter: Coordenada[][];
  address: IAddressLocations;
  OnSetLocationDisponible: (value: boolean) => void;
  OnGetLocationDisponible: () => void;
  OnGetLocation: (id: number) => void;
  OnGetLocationRouter: (id: number, date: string) => void;
  OnVerifyActive: (id: number) => void;
}
