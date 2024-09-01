export interface ICondicionDeLaOperacion {
    id: number;
    codigo: string;
    valores: string;
    isActivated: boolean;
  }
  
  export interface Cat019CodigoActividadEconomica {
    ok: boolean;
    message: string;
    status: number;
    object: ICondicionDeLaOperacion[];
  }
  