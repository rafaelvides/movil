export interface IFormasDePago {
  id: number;
  codigo: string;
  valores: string;
  isActivated: boolean;
}
export interface IFormasDePagoResponse {
  codigo: string;
  plazo: string;
  periodo: number;
  monto: number;
}
export interface IGetFormasDePago {
  ok: boolean;
  message: string;
  status: number;
  object: IFormasDePago[];
}
