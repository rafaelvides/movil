import { ITypeOfTax } from "@/offline/dto/type_of_tax.dto";

export interface IInventoryStore {
  OnsaveTypeOfTax: (typeTax: ITypeOfTax) => Promise<boolean>;
}
