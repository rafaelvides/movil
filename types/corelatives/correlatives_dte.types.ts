export interface Correlativo {
    id: number;
    code: string;
    typeVoucher: string;
    prev: number;
    next: number;
    isActive: boolean;
    emisorId: number;
    codPuntoVenta: string;
    codPuntoVentaMH: string;
    codEstable: string;
    codEstableMH: string;
    tipoEstablecimiento: string;
  }
  
  export interface IGetCorrelativesByTransmitter {
    ok: boolean
    status: number
    correlativo: Correlativo
  }
  