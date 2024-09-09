import { IAddress } from "../transmitter/address/address.types";

export interface ICustomer {
  id: number;
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
  isActive: boolean;
  esContribuyente: boolean;
  direccion: IAddress;
  direccionId: number;
  transmitterId?: number;
  tipoContribuyente?: string;
  latitude: string;
  longitude: string;
}

export interface IClienteOfflinePayload {
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
}

export interface DowloandCustomer {
  customers: IClienteOfflinePayload[];
}

export interface IPayloadCustomer {
  nombre: string;
  nombreComercial?: string;
  nrc?: string;
  nit?: string;
  tipoDocumento?: string;
  numDocumento?: string;
  codActividad?: string;
  descActividad?: string;
  bienTitulo?: string;
  telefono?: string;
  correo?: string;
  esContribuyente?: number;
  transmitterId?: number;
  directionCustomer?: CustomerDirection;
  tipoContribuyente?: string;
  latitude?: string;
  longitude?: string;
  departamento?:string
  municipio?:string
  complemento?:string
}

export interface IGetCustomers {
  ok: boolean;
  customers: ICustomer[];
}

export interface IGetCustomersPaginated {
  ok: boolean;
  customers: ICustomer[];
  total: number;
  totalPag: number;
  currentPag: number;
  nextPag: number;
  prevPag: number;
  status: number;
}

export interface CustomerDirection {
  id: number;
  departamento: string;
  nombreDepartamento: string;
  municipio: string;
  nombreMunicipio: string;
  complemento: string;
  active: boolean;
}
