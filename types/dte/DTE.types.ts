export interface Emisor {
  nit: string;
  nrc: string;
  nombre: string;
  codActividad: string;
  descActividad: string;
  nombreComercial: string;
  tipoEstablecimiento: string;
  direccion: Direccion;
  telefono: string;
  correo: string;
  codEstableMH: string | null;
  codEstable: string | null;
  codPuntoVentaMH: string | null;
  codPuntoVenta: string | null;
}
export interface Direccion {
  departamento: string;
  municipio: string;
  complemento: string;
}
export interface PayloadMH {
  ambiente: string;
  idEnvio: number;
  version: number;
  tipoDte: string;
  documento: string;
}
