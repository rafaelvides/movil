export interface Identificacion {
  version: number;
  ambiente: string;
  codigoGeneracion: string;
  fTransmision: string;
  hTransmision: string;
}
export interface Emisor {
  nit: string;
  nombre: string;
  nombreResponsable: string;
  tipoDocResponsable: string;
  numeroDocResponsable: string;
  tipoEstablecimiento: string;
  telefono: string;
  correo: string;
  codEstableMH: string | null;
  codPuntoVenta?: string | null;
}
export interface DetalleDTE {
  noItem: number;
  codigoGeneracion: string;
  tipoDoc: string;
}
export interface Motivo {
  fInicio: string;
  fFin: string;
  hInicio: string;
  hFin: string;
  tipoContingencia: number;
  motivoContingencia?: string | null;
}
export interface IContingencySales {
  nit: string;
  activo: boolean;
  passwordPri: string;
  dteJson: {
    identificacion: Identificacion;
    emisor: Emisor;
    detalleDTE: DetalleDTE[];
    motivo: Motivo;
  };
}
export interface ISendMHContingencia {
  nit: string;
  documento: string;
}
