import { CF_PagosItems, CF_TributosItems } from "@/types/svf_dte/cf.types";
import { Emisor, Direccion } from "../DTE.types";

export interface DTEToPDF {
    version: number;
    ambiente: string;
    versionApp: number;
    estado?: string | null;
    codigoGeneracion: string;
    selloRecibido: string | null;
    fhProcesamiento: string;
    clasificaMsg: string;
    codigoMsg: string;
    descripcionMsg: string;
    observaciones: string[];
    emisor: Emisor;
    receptor: Receptor;
    resumen: Resumen;
    numeroControl: string;
    cuerpoDocumento: ICuerpoDocumento[];
  }
  export interface Receptor {
    tipoDocumento?: null | string;
    numDocumento?: null | string;
    nrc: null | string;
    nit?: string | null;
    nombre: string;
    codActividad: null | string;
    descActividad: null | string;
    direccion: Direccion;
    telefono: string | null;
    correo: string;
    bienTitulo?: string | null
  }
  export interface ICuerpoDocumento {
    numItem: number;
    tipoItem: number;
    numeroDocumento: null | string;
    cantidad: number;
    codigo: string | null;
    codTributo: null | string;
    uniMedida: number;
    descripcion: string;
    precioUni: number | string;
    montoDescu: number | string;
    ventaNoSuj: number | string;
    ventaExenta: number | string;
    ventaGravada: number | string;
    tributos: null | string[];
    psv: number | string;
    noGravado: number | string;
    ivaItem?: number | string;
  }
  export interface Resumen {
    totalNoSuj: number | string;
    totalExenta: number | string;
    totalGravada: number | string;
    subTotalVentas: number | string;
    descuNoSuj: number | string;
    descuExenta: number | string;
    descuGravada: number | string;
    porcentajeDescuento: number | string;
    totalDescu: number | string;
    tributos: CF_TributosItems[] | null
    subTotal: number | string;
    ivaRete1: number | string;
    reteRenta: number | string;
    montoTotalOperacion: number | string;
    totalNoGravado: number | string;
    totalPagar: number | string;
    totalLetras: string;
    totalIva?: number | string;
    saldoFavor: number | string;
    condicionOperacion: number;
    pagos: Pago[];
    numPagoElectronico?: string | null;
  }
  export interface Pago {
    codigo: string;
    montoPago: number;
    referencia: null | string;
    plazo?: null | string;
    periodo?: null | number;
  }