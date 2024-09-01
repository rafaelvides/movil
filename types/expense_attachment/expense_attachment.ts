import { NumberArray } from "react-native-svg";
import { IExpensePayload } from "../expenses/expense.types";


export interface ICreateExpenseAttachment{
    expenseId: number;
    path:string
    ext:string
    expense: IExpensePayload
    file: File | Blob
}

export interface IUpdateExpenseAttachment{
    id:number
    expenseId:number
}


export interface IGetExpenseAttachment{
    ok:boolean[]
    data: IGetData[]
    status:number
}

export interface IGetData {
    id: number
    description: string
    total: string
    isActive: boolean
    boxId: number
    categoryExpenseId: number
    attachments: {
      path: string
      ext: string
    }
  }

  export interface IExpenseAttachment {
    id: number
    path: string
    ext: string
    isActive: boolean
    expenseId: number
  }
  