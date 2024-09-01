export interface IClientePayload {
  clienteId: number;
  nombre: string;
  nombreComercial: string;
  nrc: string;
  nit: string;
  tipoDocumento: string;
  numDocumento: string;
  codActividad: string;
  descActividad: string;
  bienTitulo: string;
  telefono: string;
  correo: string;
  active?: boolean;
  esContribuyente?: boolean;
  emisorId?: number;
  departamento?: string;
  nombreDepartamento?: string;
  municipio?: string;
  nombreMunicipio?: string;
  complemento?: string;
  tipoContribuyente?: string;
}
