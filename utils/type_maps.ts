// import { MapType } from "react-native-maps";

type MapType =
  | "standard"
  | "satellite"
  | "none"
  | "hybrid"
  | "terrain"
  | "mutedStandard"
  | "satelliteFlyover"
  | "hybridFlyover";

export const typeMap: { id: number; name: MapType }[] = [
  { id: 1, name: "standard" },
  { id: 2, name: "satellite" },
  { id: 3, name: "none" },
  { id: 4, name: "hybrid" },
  { id: 5, name: "terrain" },
  // { id: 6, name: "mutedStandard" },
  // { id: 7, name: "satelliteFlyover" },
  // { id: 8, name: "hybridFlyover" },
];
