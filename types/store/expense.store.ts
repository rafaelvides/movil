import { ICategoryExpense, IExpensePayloads, IGetExpense, IUpdateExpense } from "../expenses/expense.types"
import { IPagination } from "../GlobalTypes/Global.types"

export interface IExpenseStore {
    expenses: IGetExpense[]
    categoryExpenses: ICategoryExpense[]
    pagination_expenses: IPagination
    is_loading: boolean;
    getCategoryExpenses: () => void
    getPaginatedExpenses: (id:number, page: number, limit: number, category: string) => void
    post_expense: (payload:IExpensePayloads) => void
    update_expenses:(payload:IUpdateExpense, id:number) => void
    delete_expense:(id:number) => void
  }
  