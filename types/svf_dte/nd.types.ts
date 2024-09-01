import { CF_Receptor } from "./cf.types";
import {
  FC_ApendiceItems,
  FC_DocumentoRelacionadoItems,
  FC_Extension,
  FC_VentaTercerosItems,
} from "./fc.types";
import { NC_CuerpoDocumentoItems, NC_Resumen } from "./nc.types";
import { ResponseMHSuccess } from "./responseMH/responseMH.types";

export interface ND_Identificacion extends FC_Identificacion {}

export interface ND_DocumentoRelacionadoItems
  extends FC_DocumentoRelacionadoItems {}

export interface ND_Emisor {
  nit: string;
  nrc: string;
  nombre: string;
  codActividad: string;
  descActividad: string;
  nombreComercial: string;
  tipoEstablecimiento: string;
  direccion: {
    departamento: string;
    municipio: string;
    complemento: string;
  };
  telefono: string;
  correo: string;
}

export interface ND_Receptor extends CF_Receptor {}

export interface ND_VentaTercerosItems extends FC_VentaTercerosItems {}

export interface ND_CuerpoDocumentoItems extends NC_CuerpoDocumentoItems {}

export interface ND_Resumen extends NC_Resumen {}

export interface ND_Extension extends FC_Extension {}

export interface ND_ApendiceItems extends FC_ApendiceItems {}

export interface SVFE_ND {
  identificacion: ND_Identificacion;
  emisor: ND_Emisor;
  receptor: ND_Receptor;
  ventaTercero: ND_VentaTercerosItems[] | null;
  documentoRelacionado: ND_DocumentoRelacionadoItems[] | null;
  cuerpoDocumento: NC_CuerpoDocumentoItems[];
  resumen: NC_Resumen;
  extension: FC_Extension[] | null;
  apendice: FC_ApendiceItems[] | null;
}

export interface SVFE_ND_Firmado extends SVFE_ND {
  respuestaMH: ResponseMHSuccess;
  firma: string;
}

export interface SVFE_ND_SEND {
  nit: string;
  activo: boolean;
  passwordPri: string;
  dteJson: SVFE_ND;
}
//--------------------------------------------------------------
export interface IResponseJsonNotaDebito {
  identificacion: Identificacion;
  documentoRelacionado: DocumentoRelacionado[];
  emisor: Emisor;
  ventaTercero: any;
  receptor: Receptor;
  cuerpoDocumento: CuerpoDocumento[];
  resumen: Resumen;
  apendice: any;
  extension: any;
  respuestaMH: RespuestaMh;
  firma: string;
}

export interface Identificacion {
  codigoGeneracion: string;
  tipoContingencia: any;
  numeroControl: string;
  tipoOperacion: number;
  ambiente: string;
  fecEmi: string;
  tipoModelo: number;
  tipoDte: string;
  version: number;
  tipoMoneda: string;
  motivoContin: any;
  horEmi: string;
}

export interface DocumentoRelacionado {
  tipoDocumento: string;
  tipoGeneracion: number;
  numeroDocumento: string;
  fechaEmision: string;
}

export interface Emisor {
  nit: string;
  nrc: string;
  nombre: string;
  nombreComercial: string;
  codActividad: string;
  descActividad: string;
  tipoEstablecimiento: string;
  direccion: Direccion;
  telefono: string;
  correo: string;
}

export interface Direccion {
  departamento: string;
  municipio: string;
  complemento: string;
}

export interface Receptor {
  nit: string;
  nrc: string;
  nombre: string;
  codActividad: string;
  descActividad: string;
  nombreComercial: string;
  direccion: Direccion2;
  telefono: string;
  correo: string;
}

export interface Direccion2 {
  departamento: string;
  municipio: string;
  complemento: string;
}

export interface CuerpoDocumento {
  numItem: number;
  tipoItem: number;
  numeroDocumento: string;
  codigo: string;
  codTributo: any;
  descripcion: string;
  cantidad: number;
  uniMedida: number;
  precioUni: number;
  montoDescu: number;
  ventaNoSuj: number;
  ventaExenta: number;
  ventaGravada: number;
  tributos: string[];
}

export interface Resumen {
  totalNoSuj: number;
  totalExenta: number;
  totalGravada: number;
  subTotalVentas: number;
  descuNoSuj: number;
  descuExenta: number;
  descuGravada: number;
  totalDescu: number;
  tributos: Tributo[];
  subTotal: number;
  ivaRete1: number;
  reteRenta: number;
  ivaPerci1: number;
  montoTotalOperacion: number;
  totalLetras: string;
  condicionOperacion: number;
  numPagoElectronico: any;
}

export interface Tributo {
  codigo: string;
  descripcion: string;
  valor: number;
}

export interface RespuestaMh {
  version: number;
  ambiente: string;
  versionApp: number;
  estado: string;
  codigoGeneracion: string;
  selloRecibido: string;
  fhProcesamiento: string;
  clasificaMsg: string;
  codigoMsg: string;
  descripcionMsg: string;
  observaciones: any[];
}
export interface FC_Identificacion {
  version: number;
  ambiente: string;
  tipoDte: string;
  numeroControl: string;
  codigoGeneracion: string;
  tipoModelo: number;
  tipoOperacion: number;
  tipoContingencia: number | null;
  motivoContin: string | null;
  fecEmi: string;
  horEmi: string;
  selloRecibido?: string | null;
  sello?: string | null;
  tipoMoneda: string;
}
