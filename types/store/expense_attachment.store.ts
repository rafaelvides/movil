import { ICreateExpenseAttachment, IGetData } from "../expense_attachment/expense_attachment"



export interface IExpenseAttachmentStore{
    expense_attachments: IGetData[]
    post_expense_attachment: (expense_attachment:ICreateExpenseAttachment) => void
    get_expenses_attachment: (id:number) => void
}

