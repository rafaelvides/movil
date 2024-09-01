import { IBox } from "../box/box.types";
import { IExpenseAttachment } from "../expense_attachment/expense_attachment";



export interface IExpensePayload {
id:number;
description: string;
total: number
isActive: boolean;
boxId: number;
categoryExpenseId: number
}

export interface ICreateExpense{
id?:number;
description:string;
boxId:number;
total:number;
categoryExpenseId:number;
files?:(File | Blob)[] |null | undefined
expenses?: IGetExpense[]

}

export interface IUpdateExpense {
    id?: number
    description: string
    boxId?: number
    total: number
    categoryExpenseId: number
  }

  export interface IExpensePayloads extends ICreateExpense {
    files?: (File | Blob)[] | null | undefined;
  }


  export interface GetExpenseAttachment extends IGetExpense{
    id: number
    }

    export interface IGetExpense {
        id: number
        description: string
        total: number
        isActive: boolean
        boxId: number
        box: IBox
        categoryExpenseId: number
        categoryExpense: ICategoryExpense
        file?: File | Blob | null
        expenseAttachment: {
          path: string
        }
        attachments: IExpenseAttachment[]
      }

      export interface IGetExpensesPaginated {
        ok: boolean
        expenses: IGetExpense[]
        total: number
        totalPag: number
        currentPag: number
        prevPag: number
        nextPag: number
        status: number
      }
      export interface ICategoryExpense {
        id: number
        name: string
        isActive: boolean
      }
      export interface IResponseExpense {
        ok: boolean
        categoryExpenses: ICategoryExpense[]
        status: number
        message: string
      }
      
    
