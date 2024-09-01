import { expense_delete, expenses_update, get_category_expenses, get_expenses_paginated, save_expenses } from "@/services/expense.service";
import { IExpensePayloads, IUpdateExpense } from "@/types/expenses/expense.types";
import { IExpenseStore } from "@/types/store/expense.store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { ToastAndroid } from "react-native";
import { create } from "zustand";

export const useExpenseStore  = create<IExpenseStore>((set, get)=>({
    expenses: [],
    categoryExpenses: [],
    pagination_expenses: {
        total:0,
        totalPag: 0,
        currentPag: 0,
        nextPag: 0,
        prevPag: 0,
        status: 0,
        ok: false
    },
    is_loading: false,
    getPaginatedExpenses: async(id, page, limit, category)=>{
        set({is_loading: true})
       await get_expenses_paginated( page, limit, category )
        .then(({data})=>{

            set({
                expenses: data.expenses,
                pagination_expenses:{
                    total: data.total,
                    totalPag: data.totalPag,
                    currentPag: data.currentPag,
                    nextPag: data.nextPag,
                    prevPag: data.prevPag,
                    status: data.status,
                    ok: data.ok
                },
                is_loading: false
            })

        })
        .catch(()=>{
            set({
                expenses: [],
                pagination_expenses: {
                  total: 0,
                  totalPag: 0,
                  currentPag: 0,
                  nextPag: 0,
                  prevPag: 0,
                  status: 404,
                  ok: false
                },
                is_loading:false
              })
        })
    },
    getCategoryExpenses:   () =>{
         get_category_expenses()
        .then(({data})=>{
            set({
                categoryExpenses: data.categoryExpenses,
            })
        })
       .catch(()=>{
            set({
                categoryExpenses: [],
            })
        })
    },
    post_expense: async(payload: IExpensePayloads)=>{
       await save_expenses(payload).then(()=>{
                const boxId = Number(AsyncStorage.getItem("box") ?? 0)
                get().getPaginatedExpenses(boxId, 1, 5, "")
        })
        .catch(()=>{
            ToastAndroid.show("Error al crear gasto", ToastAndroid.SHORT)
        })
    },
    update_expenses: async(id, payload)=>{
        await expenses_update(id,payload).then((data)=>{
            const boxId= Number(AsyncStorage.getItem("box") ?? 0)
            get().getPaginatedExpenses(boxId,1,5,"")
        })
        .catch(()=>{
            ToastAndroid.show("Error al modificar el gasto",ToastAndroid.SHORT)
        })
    },
    delete_expense:async (id)=>{
        console.log("si llega el id", id)

        await expense_delete(id).then((data)=>{
            const boxId = Number(AsyncStorage.getItem("box") ?? 0)
            get().getPaginatedExpenses(boxId,1,5,"")

        })
    }
}))