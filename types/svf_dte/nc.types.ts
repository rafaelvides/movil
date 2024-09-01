import { CF_Receptor, CF_TributosItems } from "./cf.types";
import {
    FC_ApendiceItems,
    FC_DocumentoRelacionadoItems,
    FC_Emisor,
    FC_Extension,
    FC_Identificacion,
    FC_VentaTercerosItems,
} from "./fc.types";
import { ND_Emisor } from "./nd.types";
import { ResponseMHSuccess } from "./responseMH/responseMH.types";

export interface NC_Identificacion extends FC_Identificacion { }

export interface NC_DocumentosRelaciondos
    extends FC_DocumentoRelacionadoItems { }

export interface NC_Emisor extends FC_Emisor { }

export interface NC_Receptor extends CF_Receptor { }

export interface NC_VentaTercero extends FC_VentaTercerosItems { }

export interface NC_CuerpoDocumentoItems {
    numItem: number;
    tipoItem: number;
    numeroDocumento: string | null;
    codigo: string | null;
    codTributo: string | null;
    descripcion: string;
    cantidad: number;
    uniMedida: number;
    precioUni: number;
    montoDescu: number;
    ventaNoSuj: number;
    ventaExenta: number;
    ventaGravada: number;
    tributos: string[] | null;
}

export interface NC_Resumen {
    totalNoSuj: number;
    totalExenta: number;
    totalGravada: number;
    subTotalVentas: number;
    descuNoSuj: number;
    descuExenta: number;
    descuGravada: number;
    totalDescu: number;
    tributos: CF_TributosItems[];
    subTotal: number;
    ivaPerci1: number;
    ivaRete1: number;
    reteRenta: number;
    montoTotalOperacion: number;
    totalLetras: string;
    condicionOperacion: number;
    numPagoElectronico?: null
}

export interface NC_Extension extends FC_Extension { }

export interface NC_Apendice extends FC_ApendiceItems { }

export interface SVFE_NC {
    identificacion: NC_Identificacion,
    emisor: ND_Emisor,
    receptor: NC_Receptor,
    ventaTercero: NC_VentaTercero[] | null,
    documentoRelacionado: NC_DocumentosRelaciondos[] | null,
    cuerpoDocumento: NC_CuerpoDocumentoItems[],
    resumen: NC_Resumen,
    extension: FC_Extension[] | null,
    apendice: FC_ApendiceItems[] | null
}

export interface SVFE_NC_Firmado extends SVFE_NC {
    respuestaMH: ResponseMHSuccess,
    firma: string
}

export interface SVFE_NC_SEND {
    nit: string,
    activo: boolean,
    passwordPri: string,
    dteJson: SVFE_NC
}
export interface IResponseJsonNotaCredito {
    identificacion: Identificacion
    documentoRelacionado: DocumentoRelacionado[]
    emisor: Emisor
    ventaTercero: any
    receptor: Receptor
    cuerpoDocumento: CuerpoDocumento[]
    resumen: Resumen
    apendice: any
    extension: any
  }
  
  export interface Identificacion {
    codigoGeneracion: string
    tipoContingencia: any
    numeroControl: string
    tipoOperacion: number
    ambiente: string
    fecEmi: string
    tipoModelo: number
    tipoDte: string
    version: number
    tipoMoneda: string
    motivoContin: any
    horEmi: string
  }
  
  export interface DocumentoRelacionado {
    tipoDocumento: string
    tipoGeneracion: number
    numeroDocumento: string
    fechaEmision: string
  }
  
  export interface Emisor {
    nit: string
    nrc: string
    nombre: string
    nombreComercial: string
    codActividad: string
    descActividad: string
    tipoEstablecimiento: string
    direccion: Direccion
    telefono: string
    correo: string
  }
  
  export interface Direccion {
    departamento: string
    municipio: string
    complemento: string
  }
  
  export interface Receptor {
    nit: string
    nrc: string
    nombre: string
    codActividad: string
    descActividad: string
    nombreComercial: string
    direccion: Direccion2
    telefono: string
    correo: string
  }
  
  export interface Direccion2 {
    departamento: string
    municipio: string
    complemento: string
  }
  
  export interface CuerpoDocumento {
    numItem: number
    tipoItem: number
    numeroDocumento: string
    codigo: string
    codTributo: any
    descripcion: string
    cantidad: number
    uniMedida: number
    precioUni: number
    montoDescu: number
    ventaNoSuj: number
    ventaExenta: number
    ventaGravada: number
    tributos: string[]
  }
  
  export interface Resumen {
    totalNoSuj: number
    totalExenta: number
    totalGravada: number
    subTotalVentas: number
    descuNoSuj: number
    descuExenta: number
    descuGravada: number
    totalDescu: number
    tributos: Tributo[]
    subTotal: number
    ivaRete1: number
    reteRenta: number
    ivaPerci1: number
    montoTotalOperacion: number
    totalLetras: string
    condicionOperacion: number
    numPagoElectronico: any
  }
  
  export interface Tributo {
    codigo: string
    descripcion: string
    valor: number
  }