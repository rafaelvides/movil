export interface IGetUnitOfMeasurement {
    ok: boolean;
    message: string;
    status: number;
    object: IUnitOfMeasurement[];
  }
  
  export interface IUnitOfMeasurement {
    id: number;
    codigo: string;
    valores: string;
    isActivated: boolean;
  }
  