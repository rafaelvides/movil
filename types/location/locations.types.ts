import { IBranch } from "../branch/branch.types";

export interface Coord {
  altitude: number;
  heading: number;
  altitudeAccuracy: number;
  latitude: number;
  speed: number;
  longitude: number;
  accuracy: number;
}
export interface Location {
  timestamp: number;
  coords: Coord;
}
export interface IGetLocationsResponse {
  locations: Location[];
}
export interface IPayloadLocation {
  date: string;
  branchId: number;
  latitude: number;
  longitude: number;
  timestamp: number;
  currently: number;
}
export interface DetailsLocations {
  latitude: number;
  longitude: number;
  timestamp: number;
  currently: number;
  coordinateId?: number;
}
export interface Coordenada {
  coordinateDetails: DetailsLocations[];
  branch: IBranch;
}

export interface IGetLocationsRouteBranchResponse {
  coordinates: Coordenada[];
}
export interface IGetLocationsTimeReal {
  ok: true;
  data: DetailsLocations;
  status: number;
}
export interface IAddressLocations {
  address: string;
  street: string;
  subregion: string;
}
