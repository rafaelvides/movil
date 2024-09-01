import { ambiente, MH_QUERY } from "@/utils/constants";

export const QR_URL = (codeGen: string, fecEmi: string) => {
  const qr_value =
    MH_QUERY +
    "?ambiente=" +
    ambiente +
    "&codGen=" +
    codeGen +
    "&fechaEmi=" +
    fecEmi;

  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    qr_value
  )}`;
};
