export interface TipoDeItem {
  id: number;
  codigo: string;
  valores: string;
  isActivated: boolean;
}

export interface Cat011TipoDeItem {
  ok: boolean;
  message: string;
  status: number;
  object: TipoDeItem[];
}
