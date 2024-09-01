export const generateURL = (
  name: string,
  generation: string,
  format: "json" | "pdf",
  typeDte: string,
  fecEmi: string
) => {
  return `CLIENTES/${name}/${new Date().getFullYear()}/VENTAS/${
    typeDte === "01" ? "FACTURAS" : "CRÉDITO_FISCAL"
  }/${fecEmi}/${generation}/${generation}.${format}`;
};
export const generateNoteURL = (
  name: string,
  generation: string,
  format: "json" | "pdf",
  typeDte: string,
  fecEmi: string
) => {
  return `CLIENTES/${name}/${new Date().getFullYear()}/VENTAS/${
    typeDte === "06" ? "NOTAS_DE_DEBITO" : "NOTAS_DE_CREDITO"
  }/${fecEmi}/${generation}/${generation}.${format}`;
};