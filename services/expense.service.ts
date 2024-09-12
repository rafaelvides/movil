import { get_box_data } from "@/plugins/async_storage";
import { return_token } from "@/plugins/async_storage";
import {
  ICreateExpense,
  IGetExpense,
  IGetExpensesPaginated,
  IResponseExpense,
  IUpdateExpense,
} from "@/types/expenses/expense.types";
import { API_URL } from "@/utils/constants";
import axios, { AxiosError } from "axios";
import { ToastAndroid } from "react-native";

export const get_expenses_paginated = async (
  id:number,
  page= 1,
  limit: number,
  category: string
) => {
  const token = await return_token();
  const data = await get_box_data()
  id = Number(data?.id)
  return axios.get<IGetExpensesPaginated>(
    `${API_URL}/expenses/list-paginated/${id}?page=${page}&limit=${limit}&category=${category}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  // console.log("list paginated expenses", (await response).data.currentPag)
  // return response
};

export const create_expense = async (payload: ICreateExpense) => {
  const token = await return_token();
  const response = await axios.post<{ ok: boolean; status: number }>(
    `${API_URL}/expenses`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "json",
    }
  );
  return response.data;
};

export const get_spent_list = async (id: number): Promise<IGetExpense> => {
  const { data } = await axios.get<IGetExpense>(`${API_URL}/expense/${id}`);
  return data;
};

export const expense_delete = async (id: number) => {
  const token = await return_token()
  const { data } = await axios.delete<IGetExpense>(API_URL + "/expenses/" + id,{
headers:{
  Authorization: `Bearer ${token}`,
}
  });
  return data;
};

export const get_category_expenses = async () => {
  const token = (await return_token()) ?? "";
  return axios.get<IResponseExpense>(API_URL + "/category-expenses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const expenses_update = async(payload:IUpdateExpense, id:number)=>{
const token = await return_token() ?? "";
return axios.patch<IResponseExpense>(API_URL + "/expenses/"+ id,payload,{
  headers:{
    Authorization:`Bearer ${token}`
  }
})
}

export const save_expenses = async (payload: ICreateExpense) => {
  try {
    const token = (await return_token()) ?? "";
    const formData = new FormData();

    if (payload.files) {
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
    }
    formData.append("description", payload.description);
    formData.append("total", payload.total.toString());
    formData.append("boxId", payload.boxId?.toString());
    formData.append("categoryExpenseId", payload.categoryExpenseId.toString());

   const response = await axios.post<{ok:boolean}>(API_URL + "/expenses", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response
  } catch (error: AxiosError | any) {
    ToastAndroid.show("Error al crear el gasto", ToastAndroid.SHORT);
  }
};
