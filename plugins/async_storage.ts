import { UserLogin } from "@/types/user/user.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import {
  ResponseMHSuccess,
  SendMHFailed,
} from "@/types/svf_dte/responseMH/responseMH.types";
import { PayloadMH } from "@/types/dte/DTE.types";
import { SVFE_FC_SEND } from "@/types/svf_dte/fc.types";
import { IConfiguration } from "@/types/configuration/configuration.types";
import { IBox } from "@/types/box/box.types";
import { jwtDecode } from "jwt-decode";

export const box_data = (box: IBox ) =>{
  return AsyncStorage.setItem("box_data", JSON.stringify(box))
}

export const get_box_data = async () =>{
const box = await AsyncStorage.getItem("box_data")
  if(box){
    return JSON.parse(box) as IBox
  }else{
    return undefined
  }
}
export const save_employee_id = (id: string) => {
  return AsyncStorage.setItem("employee_id", id);
}
export const get_employee_id = () => {
  return AsyncStorage.getItem("employee_id");
}

export const save_token = (token: string) => {
  return AsyncStorage.setItem("token", token);
}
export const return_token = () => {
  return AsyncStorage.getItem("token");
}
export const remove_token = async () => {
  try {
    await AsyncStorage.removeItem("token");
    return true;
  } catch (e) {
    return false;
  }
};
export const is_expired_token = (token: string) => {
    const decoded = jwtDecode(token);
    if (decoded && decoded.exp) {
      return Date.now() >= decoded.exp * 1000;
    }
    return true;
  };
  export const is_auth = async () => {
    const token = await return_token();
    return token && !is_expired_token(token);
  };
export const delete_box = () => {
  AsyncStorage.removeItem("box_data");
};
export const save_branch_id = (branch_id: string) => {
  return AsyncStorage.setItem("branch_id", branch_id);
};
export const get_branch_id = () => {
  return AsyncStorage.getItem("branch_id");
};
export const delete_branch_id = () => {
  return AsyncStorage.removeItem("branch_id");
};
export const save_user = (user: UserLogin) => {
  return AsyncStorage.setItem("user", JSON.stringify(user));
};
export const get_user = async () => {
  try {
    const user = await AsyncStorage.getItem("user");
    if (user) {
      return JSON.parse(user) as UserLogin;
    } else {
      return undefined;
    }
  } catch (e) {
    return undefined;
  }
};
export const save_point_sale_Id = (id: string) => {
  return AsyncStorage.setItem("pointOfSaleId", id);
}
export const get_point_sale_Id = () => {
  return AsyncStorage.getItem("pointOfSaleId");
}
export const save_configuration = (personalization: IConfiguration) => {
  return AsyncStorage.setItem(
    "personalization",
    JSON.stringify(personalization)
  );
};

export const get_configuration = async () => {
  try {
    const personalization = await AsyncStorage.getItem("personalization");
    console.log("VER PERSONALIZACION EN ARCHIVO DE ASYNC STORAGE", personalization);
    if (personalization) {
      return JSON.parse(personalization) as IConfiguration;
      
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
};



export const delete_configuration = () => {
  return AsyncStorage.removeItem("personalization");
};

export const get_personalization = async () => {
  const personalization = await AsyncStorage.getItem("personalization");
  return JSON.parse(personalization || "{}") as {
    name: string;
    logo: string;
  };
};

export const Dte_error = async (
  dte: SVFE_FC_SEND,
  error: AxiosError<SendMHFailed>,
  data_send: PayloadMH,
  data: ResponseMHSuccess,
  observaciones: string
) => {
  try {
    await AsyncStorage.setItem(
      "dte_error",
      JSON.stringify({ dte, error, data_send, data, observaciones })
    );
  } catch (error) {
    return false;
  }
};
