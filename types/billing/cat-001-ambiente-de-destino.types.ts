export interface IGetAmbienteDestino {
    ok: boolean;
    message: string;
    status: number;
    object: IAmbienteDestino[];
  }
  
  export interface IAmbienteDestino {
    id: number;
    codigo: string;
    valores: string;
    isActivated: boolean;
  }
  