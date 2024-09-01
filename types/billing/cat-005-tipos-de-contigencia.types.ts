export interface ITiposDeContingencia {
  id: number;
  codigo: string;
  valores: string;
  isActivated: boolean;
}

export interface IGetTiposDeContingencia {
  ok: boolean;
  message: string;
  status: number;
  object: ITiposDeContingencia[];
}
