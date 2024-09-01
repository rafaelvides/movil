import { create_expense_attachment, get_expense_attachment } from "@/services/expense_attachment.service";
import { ICreateExpenseAttachment } from "@/types/expense_attachment/expense_attachment";
import { IExpenseAttachmentStore } from "@/types/store/expense_attachment.store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastAndroid } from "react-native";
import { create } from "zustand";

export const useExpenseAttachmentStore = create<IExpenseAttachmentStore>((set,get) => ({
    expense_attachments:[],
    
    get_expenses_attachment: (id:number)=>{
        get_expense_attachment(id)
        .then(({ data }) => {
            set({
              expense_attachments: data.data
            })
          })
          .catch(() => {
            ToastAndroid.show("Error al cargar archivos", ToastAndroid.SHORT);
          })
    },
    post_expense_attachment: async (expense_attachment: ICreateExpenseAttachment) =>{
         const idBox = Number(AsyncStorage.getItem("box_id" ?? 0))
        create_expense_attachment(expense_attachment)
        .then(() => {
            get().get_expenses_attachment(idBox)
        })
        .catch(() => {
            ToastAndroid.show("Error al crear el archivo", ToastAndroid.SHORT);
        })   
     }
        
}))