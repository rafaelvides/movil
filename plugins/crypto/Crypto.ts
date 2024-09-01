import CryptoJS from "crypto-js";
import { CRPAPP } from "../../utils/constants";

export const encryptData = (data: unknown): string => {
  const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), CRPAPP).toString();
  return JSON.stringify({ data: encryptedData });
};

export const decryptData = (ciphertext: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, CRPAPP);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
