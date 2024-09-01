export interface ICat022TipoDeDocumentoDeIde {
  id: number;
  codigo: string;
  valores: string;
  isActivated: boolean;
}
export interface IGetCat022TipoDeDocumentoDeIde {
  ok: boolean;
  message: string;
  status: number;
  objects: ICat022TipoDeDocumentoDeIde[];
}
