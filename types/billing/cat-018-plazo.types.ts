export interface IPlazo {
    id: number;
    codigo: string;
    valores: string;
    isActivated: boolean;
  }
  
  export interface ICat019CodigoActividadEconomica {
    ok: boolean;
    message: string;
    status: number;
    object: IPlazo[];
  }