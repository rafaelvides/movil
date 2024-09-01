export interface Departamento {
  id: number;
  codigo: string;
  valores: string;
  isActivated: boolean;
}

export interface Cat012Departamento {
  ok: boolean;
  message: string;
  status: number;
  object: Departamento[];
}
