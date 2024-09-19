import { Correlativo } from "./correlatives_dte.types";

export interface ICorrelativesDteStore {
    getCorrelativesByDte: (transmitter_id: number, dte: string) => Promise<Correlativo | undefined>
  }