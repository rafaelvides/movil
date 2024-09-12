import { return_token } from "@/plugins/async_storage";
import { IGetEmployeesList } from "@/types/employee/employee.types";
import { API_URL } from "@/utils/constants";
import axios from "axios";
export const get_employees_list = async () => {
  const token = await return_token();
  return axios.get<IGetEmployeesList>(`${API_URL}/employees`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
