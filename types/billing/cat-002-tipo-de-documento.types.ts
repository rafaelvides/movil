export interface ICat002TipoDeDocumento {
  id: number;
  codigo: string;
  valores: string;
  isActivated: boolean;
}
export interface IGetCat002TipoDeDocumento {
  ok: boolean;
  message: string;
  status: number;
  objects: ICat002TipoDeDocumento[];
}
