import jsPDF from "jspdf";
import {
  getHeightText,
  returnBoldText,
} from "../../components/Global/styles/global.styles";
import { SeedcodeCatalogosMhService } from "seedcode-catalogos-mh";
import autoTable, { RowInput } from "jspdf-autotable";
import { formatCurrency } from "@/utils/dte";
import { SVFE_FSE_Firmado } from "@/types/svf_dte/fse.types";

export const makePDFSujetoExcluido = (
  doc: jsPDF,
  dte: SVFE_FSE_Firmado,
  QR: Uint8Array,
  imageBase64: string | null,
  img_logo: string | null,
  isInvalid: boolean
) => {
  doc.addImage(
    `data:image/png;base64,${img_logo}`,
    "PNG",
    10,
    20,
    20,
    17,
    "FAST",
    "FAST"
  );
  doc.setFontSize(7);
  const name = doc.splitTextToSize(`${dte.emisor.nombre}`, 90);
  const nameH = getHeightText(doc, name);
  returnBoldText(doc, name, 90, 20, "center");
  doc.setFontSize(6);
  const actEco = doc.splitTextToSize(
    `Actividad económica: ${dte.emisor.descActividad}`,
    75
  );

  const distActEco = nameH + 20.5;

  returnBoldText(doc, actEco, 90, distActEco, "center");
  const address = doc.splitTextToSize(
    `DIRECCION : ${dte.emisor.direccion.complemento} ${returnAddress(
      dte.emisor.direccion.departamento,
      dte.emisor.direccion.municipio
    )}, El Salvador`,
    70
  );

  const act = getHeightText(doc, actEco);

  const distAddress = distActEco + act + 0.5;

  returnBoldText(doc, address, 90, distAddress, "center");

  const tel = getHeightText(doc, address);

  const distTel = distAddress + tel + 0.5;

  returnBoldText(doc, `TEL: ${dte.emisor.telefono}`, 90, distTel, "center");

  doc.roundedRect(doc.internal.pageSize.width - 45, 20, 40, 20, 2, 2, "S");
  doc.addImage(QR, "PNG", doc.internal.pageSize.width - 67, 20, 18, 18);

  doc.setFontSize(6);
  const text1Y = distTel + 20;
  const namSplit = doc.splitTextToSize(
    `NOMBRE : ${dte.sujetoExcluido.nombre}`,
    120
  );
  const nameHeight = getHeightText(doc, namSplit);
  doc.text(namSplit, 10, text1Y, {
    align: "left",
  });

  const text2Y = text1Y + nameHeight + 1;
  const addressSplit = doc.splitTextToSize(
    `${dte.sujetoExcluido.direccion.complemento.toUpperCase()} ${returnAddress(
      dte.sujetoExcluido.direccion.departamento,
      dte.sujetoExcluido.direccion.municipio
    ).toUpperCase()}`,
    120
  );
  const addressHeight = getHeightText(doc, addressSplit);
  doc.text(addressSplit, 10, text2Y, { align: "left" });

  const text3Y = text2Y + addressHeight + 1;
  const giroSplit = doc.splitTextToSize(
    `GIRO : ${dte.sujetoExcluido.descActividad}`,
    120
  );
  const giroHeight = getHeightText(doc, giroSplit);
  doc.text(giroSplit, 10, text3Y, { align: "left" });

  const text4Y = text3Y + giroHeight + 1;
  const condOpe = doc.splitTextToSize(
    "CONDICION DE LA OPERACION: CONTADO",
    120
  );
  const condOpeHeight = getHeightText(doc, condOpe);
  doc.text(condOpe, 10, text4Y, { align: "left" });

  // Second line

  const text1Y2 = distTel + 20;
  const nrcSplit = doc.splitTextToSize(
    `DUI ${" "} ${" "} : ${" "}${dte.sujetoExcluido.numDocumento}`,
    90
  );
  const nrcHeight = getHeightText(doc, nrcSplit);
  doc.text(nrcSplit, 125, text1Y2, {
    align: "left",
  });

  // const text2Y2 = text1Y2 + nrcHeight + 1;
  // const nitSplit = doc.splitTextToSize(
  //   `NIT ${" "} ${" "} ${" "} : ${" "}${dte.receptor.nit}`,
  //   120
  // );
  // const nitHeight = getHeightText(doc, nitSplit);
  // doc.text(nitSplit, 125, text2Y2, { align: "left" });

  const text3Y2 = text1Y2 + nrcHeight + 1;
  const codigoGen = doc.splitTextToSize(
    `CODIGO GENERACION ${" "} ${" "} : ${" "}${
      dte.identificacion.codigoGeneracion
    }`,
    120
  );
  const codigoGenHeight = getHeightText(doc, codigoGen);
  doc.text(codigoGen, 125, text3Y2, { align: "left" });

  const text4Y2 = text3Y2 + codigoGenHeight + 1;
  const numeroControl = doc.splitTextToSize(
    `NUMERO DE CONTROL ${" "} ${" "} : ${" "}${
      dte.identificacion.numeroControl
    }`,
    120
  );
  const numeroControlHeight = getHeightText(doc, numeroControl);
  doc.text(numeroControl, 125, text4Y2, { align: "left" });

  const text5Y2 = text4Y2 + numeroControlHeight + 1;
  const sello = doc.splitTextToSize(
    `SELLO ${" "} ${" "} : ${" "}${dte.respuestaMH.selloRecibido}`,
    120
  );
  const selloHeight = getHeightText(doc, sello);
  doc.text(sello, 125, text5Y2, { align: "left" });

  const text6Y2 = text5Y2 + selloHeight + 1;
  const fecHora = doc.splitTextToSize(
    `FECHA HORA EMISION ${" "} ${" "} : ${" "}${dte.identificacion.fecEmi}: ${
      dte.identificacion.horEmi
    }`,
    120
  );
  const fecHoraHeight = getHeightText(doc, fecHora);
  doc.text(fecHora, 125, text6Y2, { align: "left" });

  const text7Y2 = text6Y2 + fecHoraHeight + 1;
  const modelo = doc.splitTextToSize(
    `MODELO DE FACTURACION ${" "} ${" "} : ${" "} Previo`,
    120
  );
  const modeloHeight = getHeightText(doc, modelo);
  doc.text(modelo, 125, text7Y2, { align: "left" });

  const text8Y2 = text7Y2 + modeloHeight + 1;
  const transmision = doc.splitTextToSize(
    `MODELO DE FACTURACION ${" "} ${" "} : ${" "} Previo`,
    120
  );
  const transmisionHeight = getHeightText(doc, transmision);
  doc.text(transmision, 125, text8Y2, { align: "left" });

  const totalHeight = nameHeight + addressHeight + giroHeight + condOpeHeight;
  const totalHeight2 =
    nrcHeight +
    codigoGenHeight +
    numeroControlHeight +
    selloHeight +
    fecHoraHeight +
    modeloHeight +
    transmisionHeight;

  doc.roundedRect(
    5,
    distTel + 15,
    doc.internal.pageSize.width - 10,
    totalHeight > totalHeight2 ? totalHeight + 10 : totalHeight2 + 15,
    2,
    2,
    "S"
  );

  const lastElementHeight = distTel + 15 + totalHeight2 + 20;

  const headers = [
    "CANTIDAD",
    "DESCRIPCION",
    "PRECIO UNITARIO",
    "DESCUENTO POR ITEM",
    "COMPRAS",
  ];

  const array_object: unknown[] = [];
  dte.cuerpoDocumento.map((prd) => {
    array_object.push(
      Object.values({
        qty: prd.cantidad,
        desc: prd.descripcion,
        price: formatCurrency(prd.precioUni),
        descu: formatCurrency(prd.montoDescu),
        vtGrav: formatCurrency(prd.compra),
      })
    );
  });

  autoTable(doc, {
    theme: "plain",
    startY: lastElementHeight,
    margin: {
      right: 5,
      left: 5,
      bottom: doc.internal.pages.length > 1 ? 10 : 55,
      top: 50,
    },
    head: [headers],
    body: array_object as unknown as RowInput[],
    columnStyles: {
      0: { cellWidth: 15, halign: "center", cellPadding: 2 },
      1: { cellWidth: 80, cellPadding: 2 },
      2: {
        cellWidth: 35,
        cellPadding: 2,
      },
      3: {
        cellWidth: 35,
        cellPadding: 2,
      },
      4: {
        cellWidth: "auto",
        cellPadding: 2,
      },
    },
    headStyles: {
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      fontSize: 5,
    },
    bodyStyles: {
      fontSize: 7,
      // lineColor: "#000",
      // lineWidth:0.1
    },
  });
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    if (i !== 1) {
      headerDoc(doc, dte, img_logo);
    }
    doc.roundedRect(doc.internal.pageSize.width - 45, 20, 40, 20, 2, 2, "S");
    doc.setFontSize(5);
    returnBoldText(
      doc,
      "DOCUMENTO TRIBUTARIO ELECTRONICO",
      doc.internal.pageSize.width - 25,
      23,
      "center"
    );
    const docName = doc.splitTextToSize("FACTURA SUJETO EXCLUIDO", 30);
    doc.setFontSize(6);
    returnBoldText(
      doc,
      docName,
      doc.internal.pageSize.width - 25,
      26,
      "center"
    );
    doc.setFontSize(7);
    returnBoldText(
      doc,
      `N.I.T. ${dte.emisor.nit}`,
      doc.internal.pageSize.width - 25,
      33,
      "center"
    );
    returnBoldText(
      doc,
      `NRC No. ${dte.emisor.nrc}`,
      doc.internal.pageSize.width - 25,
      36,
      "center"
    );
    doc.addImage(QR, "PNG", doc.internal.pageSize.width - 67, 20, 18, 18);
    const margin = 5;
    const rectWidth = doc.internal.pageSize.getWidth() - 2 * margin;
    const radius = 2;
    const rectHeight =
      doc.internal.pageSize.getHeight() -
      (i > 1 ? 30 : lastElementHeight) -
      margin +
      (i > 1 ? 0 : pageCount > 1 ? 50 : 0);

    const rectMargin = doc.internal.pageSize.getHeight() - 30 - margin;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor("#ced4da");
    doc.roundedRect(
      100,
      i > 1 ? 50 : lastElementHeight,
      35,
      pageCount > 1 ? rectHeight - 50 : rectHeight - 30,
      0,
      0,
      "S"
    );
    doc.roundedRect(
      170,
      i > 1 ? 50 : lastElementHeight,
      35,
      pageCount > 1 ? rectHeight - 50 : rectHeight - 30,
      0,
      0,
      "S"
    );
    doc.roundedRect(
      margin,
      i !== 1 ? 50 : lastElementHeight,
      rectWidth,
      rectHeight - (i !== 1 ? 20 : pageCount === 1 ? 0 : 50),
      radius,
      radius,
      "S"
    );
    doc.setFillColor("#ced4da");
    doc.roundedRect(
      margin,
      i !== 1 ? 50 : lastElementHeight,
      rectWidth,
      7,
      radius,
      radius,
      "FD"
    );
    autoTable(doc, {
      startY: i !== 1 ? 50 : lastElementHeight,
      theme: "plain",
      head: [headers],
      columnStyles: {
        0: { cellWidth: 15, halign: "center", cellPadding: 2 },
        1: { cellWidth: 80, cellPadding: 2 },
        2: {
          cellWidth: 35,
          cellPadding: 2,
        },
        3: {
          cellWidth: 35,
          cellPadding: 2,
        },
        4: {
          cellWidth: "auto",
          cellPadding: 2,
        },
      },
      headStyles: {
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 5,
      },
      body: [["", "", "", "", ""]],
      margin: {
        right: 5,
        left: 5,
      },
    });
    if (pageCount > 1 && i > 1) {
      doc.line(5, rectMargin, doc.internal.pageSize.getWidth() - 5, rectMargin);
      doc.line(
        5,
        rectMargin + 7,
        doc.internal.pageSize.getWidth() - 5,
        rectMargin + 7
      );
      footerDocument(doc, rectMargin, dte);
      doc.line(125, rectHeight + 30, 125, rectMargin + 7);
    }

    if (pageCount === 1 && 1 === 1) {
      doc.line(5, rectMargin, doc.internal.pageSize.getWidth() - 5, rectMargin);
      doc.line(
        5,
        rectMargin + 7,
        doc.internal.pageSize.getWidth() - 5,
        rectMargin + 7
      );
      footerDocument(doc, rectMargin, dte);
      doc.line(
        125,
        doc.internal.pageSize.height - 28,
        125,
        doc.internal.pageSize.height - 5
      );
    }
  }

  return doc.output("datauristring");
};

export const footerDocument = (
  doc: jsPDF,
  rectMargin: number,
  dte: SVFE_FSE_Firmado
) => {
  const { resumen } = dte;
  doc.text(`${resumen.totalLetras}`, 10, rectMargin + 4);
  doc.text("SUMA DE VENTAS:", 120, rectMargin + 4);
  doc.text(`$${" "} ${" "} ${resumen.totalCompra}`, 185, rectMargin + 4);
  doc.setFontSize(6);
  returnBoldText(doc, "Observaciones", 10, rectMargin + 15);

  doc.text("Suma Total de Operaciones:", 127, rectMargin + 10);
  doc.text(
    "Monto global Desc., Rebajas y otros a ventas:",
    127,
    rectMargin + 13
  );
  doc.text("Sub-Total:", 127, rectMargin + 16);
  doc.text("IVA Retenido:", 127, rectMargin + 19);
  doc.text("Retención Renta:", 127, rectMargin + 22);
  doc.text("Total a Pagar:", 127, rectMargin + 25);

  for (let i = 0; i < 6; i++) {
    doc.text("$", 185, rectMargin + i * 3 + 10);
  }

  const totals = [
    // resumen.descuGravada.toFixed(2),
    // resumen.descuNoSuj.toFixed(2),
    // resumen.descuExenta.toFixed(2),
    // resumen.descuGravada.toFixed(2),
    // resumen.tributos
    //   .map((tr) => Number(tr.valor))
    //   .reduce((a, b) => a + b)
    //   .toFixed(2),
    resumen.subTotal.toFixed(2),
  ];

  totals.forEach((total, index) => {
    doc.text(total, 202.5, rectMargin + index * 3 + 10, {
      align: "right",
    });
  });
};

// #region Header Table
export const headerDoc = (
  doc: jsPDF,
  dte: SVFE_FSE_Firmado,
  img_logo: string | null
) => {
  doc.addImage(
    `data:image/png;base64,${img_logo}`,
    "PNG",
    10,
    20,
    20,
    17,
    "FAST",
    "FAST"
  );
  doc.setFontSize(7);
  const name = doc.splitTextToSize(`${dte.emisor.nombre}`, 90);
  const nameH = getHeightText(doc, name);
  returnBoldText(doc, name, 90, 20, "center");
  doc.setFontSize(6);
  const actEco = doc.splitTextToSize(
    `Actividad económica: ${dte.emisor.descActividad}`,
    75
  );

  const distActEco = nameH + 20.5;

  returnBoldText(doc, actEco, 90, distActEco, "center");
  const address = doc.splitTextToSize(
    `DIRECCION : ${dte.emisor.direccion.complemento} ${returnAddress(
      dte.emisor.direccion.departamento,
      dte.emisor.direccion.municipio
    )}, El Salvador`,
    70
  );

  const act = getHeightText(doc, actEco);

  const distAddress = distActEco + act + 0.5;

  returnBoldText(doc, address, 90, distAddress, "center");

  const tel = getHeightText(doc, address);

  const distTel = distAddress + tel + 0.5;

  returnBoldText(doc, `TEL: ${dte.emisor.telefono}`, 90, distTel, "center");
};

// #region Return Address

export const returnAddress = (depP: string, munP: string) => {
  const catalogos_service = new SeedcodeCatalogosMhService();
  const depF = catalogos_service
    .get012Departamento()
    .find((dep) => dep.codigo === depP);

  const munF = catalogos_service
    .get013Municipio(depP)
    ?.find((mun) => mun.codigo === munP);

  return `${munF?.valores ?? ""}, ${depF?.valores ?? ""}`;
};
