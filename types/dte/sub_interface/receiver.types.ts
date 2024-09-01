export interface Direccion {
  departamento: string;
  municipio: string;
  complemento: string;
}
export interface Receptor {
  tipoDocumento: null | string;
  numDocumento: null | string;
  nit: string;
  nrc: string;
  nombre: string;
  codActividad: string;
  descActividad: string;
  nombreComercial: string;
  direccion: Direccion;
  telefono: string;
  correo: string;
}
