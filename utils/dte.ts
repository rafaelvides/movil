import { MH_QUERY } from "./constants";

export const formatCurrency = (value: number) => {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};
export const formatCurrencyValue = (value: number) => {
  const formattedValue = value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  // Eliminar el símbolo de moneda
  const numericValue = formattedValue.replace(/[^0-9.-]+/g, "");

  return numericValue;
};
export function formatearNumero(numero: number): string {
  const numeroFormateado: string = numero.toString().padStart(15, "0");
  return numeroFormateado;
}
export const generate_control = (
  tipo_sol: string,
  codStable: string,
  codPVenta: string,
  nTicket: string
) => {
  return `DTE-${tipo_sol}-${codStable + codPVenta}-${nTicket}`;
};
export const generateURLMH = (
  ambiente: string,
  codegen: string,
  fechaEmi: string
) => {
  return `${MH_QUERY}?ambiente=${ambiente}&codGen=${codegen}&fechaEmi=${fechaEmi}`;
};
