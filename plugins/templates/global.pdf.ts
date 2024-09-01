import jsPDF from "jspdf"
import { Theme } from "@/hooks/types/theme.types"
import autoTable from "jspdf-autotable"

export const makeHeader = (
  doc: jsPDF,
  codeGen: string,
  sello: string,
  numControl: string,
  fecHora: string
) => {
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  returnBoldText(doc, "Código de Generación:", 10, 25)
  doc.text(codeGen, getWidthText(doc, "Código de Generación:"), 25, {
    align: "left"
  })
  returnBoldText(doc, "Número de Control:", 10, 28)
  doc.text(numControl, getWidthText(doc, "Número de Control:"), 28, {
    align: "left"
  })
  returnBoldText(doc, "Sello de Recepción:", 10, 31)
  doc.text(sello, getWidthText(doc, "Sello de Recepción:"), 31, {
    align: "left"
  })
  returnBoldText(
    doc,
    "Modelo de Facturación:",
    doc.internal.pageSize.getWidth() - getWidthText(doc, "Previo"),
    25,
    "right"
  )
  doc.text("Previo", doc.internal.pageSize.getWidth() - 10, 25, {
    align: "right"
  })
  returnBoldText(
    doc,
    "Tipo de Transmisión:",
    doc.internal.pageSize.getWidth() - getWidthText(doc, "Normal"),
    28,
    "right"
  )
  doc.text("Normal", doc.internal.pageSize.getWidth() - 10, 28, {
    align: "right"
  })
  returnBoldText(
    doc,
    "Fecha y Hora de Generación:",
    doc.internal.pageSize.getWidth() - getWidthText(doc, fecHora),
    31,
    "right"
  )
  doc.text("2024-06-08 09:15:09", doc.internal.pageSize.getWidth() - 10, 31, {
    align: "right"
  })
}

export const returnBoldText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  alignContent: "left" | "center" | "right" = "left"
) => {
  doc.setFont("helvetica", "bold")
  doc.text(text, x, y, { align: alignContent })
  doc.setFont("helvetica", "normal")
}

export const getWidthText = (doc: jsPDF, text: string, plus: number = 13) => {
  const dimensions = doc.getTextDimensions(text)
  return dimensions.w + plus
}

export const getHeightText = (doc: jsPDF, text: string) => {
  const dimensions = doc.getTextDimensions(text)
  return dimensions.h
}

export const createTableResumen = (
  doc: jsPDF,
  finalY: number,
  bodyContent: string[],
  theme: Theme
) => {
  autoTable(doc, {
    startY: finalY,
    theme: "grid",
    head: [["", "", "", ""]],
    showHead: "never",
    columnStyles: {
      0: { cellWidth: 15, fillColor: "#fff", lineWidth: 0 },
      1: { cellWidth: "wrap", fillColor: "#fff", lineWidth: 0 },
      2: { cellWidth: 80, lineWidth: 0.1, lineColor: theme.colors.third },
      3: { cellWidth: 15, lineWidth: 0.1, lineColor: theme.colors.third }
    },
    headStyles: {
      fillColor: "#ffff",
      textColor: "#000",
      lineWidth: 0.1
    },
    bodyStyles: {
      fontSize: 6,
      halign: "right",
      cellPadding: 1,
      fillColor: "#fff"
    },
    body: [bodyContent]
  })
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
}
