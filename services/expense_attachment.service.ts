import { return_token } from "@/plugins/secure_store";
import { ICreateExpenseAttachment, IGetExpenseAttachment } from "@/types/expense_attachment/expense_attachment";
import { API_URL } from "@/utils/constants";
import axios from "axios";

export const create_expense_attachment = async(
    payload: ICreateExpenseAttachment
):Promise<Promise<ICreateExpenseAttachment>> =>{
const formData = new FormData()

if(payload.file){
    formData.append("file", payload.file)
}
formData.append("file", payload.file)

const response = await axios.post<ICreateExpenseAttachment>(
    API_URL, formData,{
        headers:{
            "Content-Type": "multipart/form-data"
        }
    }
)
return response.data
}


export const get_expense_attachment = async (id: number) => {
    const token = return_token() ?? ""
    return await axios.get<IGetExpenseAttachment>(`${API_URL}/expense-attachments/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }