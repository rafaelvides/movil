export interface Municipio {
  id: number;
  codigo: string;
  valores: string;
  departamento: string;
  isActivated: boolean;
}

export interface Cat013Municipio {
  ok: boolean;
  message: string;
  status: number;
  object: Municipio[];
}
