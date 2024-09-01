import jsPDF from "jspdf";
import {
  getHeightText,
  returnBoldText,
} from "../../components/Global/styles/global.styles";
import autoTable, { RowInput } from "jspdf-autotable";
import { SeedcodeCatalogosMhService } from "seedcode-catalogos-mh";
import { SVFE_NC_Firmado } from "@/types/svf_dte/nc.types";
import { formatCurrency } from "@/utils/dte";

export const makeNotaCreditoPDF = (
  doc: jsPDF,
  JSONDTE: SVFE_NC_Firmado,
  QR: Uint8Array,
  imageBase64: string | null,
  img_logo: string | null,
  isInvalid: boolean
) => {
  let finalYFirtsPage = 0;

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
  const name = doc.splitTextToSize(`${JSONDTE.emisor.nombre}`, 90);
  const nameH = getHeightText(doc, name);
  returnBoldText(doc, name, 90, 20, "center");
  doc.setFontSize(6);
  const actEco = doc.splitTextToSize(
    `Actividad económica: ${JSONDTE.emisor.descActividad}`,
    75
  );

  const distActEco = nameH + 20.5;

  returnBoldText(doc, actEco, 90, distActEco, "center");
  const address = doc.splitTextToSize(
    `DIRECCION : ${JSONDTE.emisor.direccion.complemento} ${returnAddress(
      JSONDTE.emisor.direccion.departamento,
      JSONDTE.emisor.direccion.municipio
    )}, El Salvador`,
    70
  );

  const act = getHeightText(doc, actEco);

  const distAddress = distActEco + act + 0.5;

  returnBoldText(doc, address, 90, distAddress, "center");

  const tel = getHeightText(doc, address);

  const distTel = distAddress + tel + 0.5;

  returnBoldText(doc, `TEL: ${JSONDTE.emisor.telefono}`, 90, distTel, "center");

  doc.roundedRect(doc.internal.pageSize.width - 45, 20, 40, 20, 2, 2, "S");
  doc.addImage(QR, "PNG", doc.internal.pageSize.width - 67, 20, 18, 18);

  doc.setFontSize(6);
  const text1Y = distTel + 20;
  const namSplit = doc.splitTextToSize(
    `NOMBRE : ${JSONDTE.receptor.nombre}`,
    120
  );
  const nameHeight = getHeightText(doc, namSplit);
  doc.text(namSplit, 10, text1Y, {
    align: "left",
  });

  const text2Y = text1Y + nameHeight + 1;
  const addressSplit = doc.splitTextToSize(
    `${JSONDTE.receptor.direccion.complemento.toUpperCase()} ${returnAddress(
      JSONDTE.receptor.direccion.departamento,
      JSONDTE.receptor.direccion.municipio
    ).toUpperCase()}`,
    120
  );
  const addressHeight = getHeightText(doc, addressSplit);
  doc.text(addressSplit, 10, text2Y, { align: "left" });

  const text3Y = text2Y + addressHeight + 1;
  const giroSplit = doc.splitTextToSize(
    `GIRO : ${JSONDTE.receptor.descActividad}`,
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
    `NRC ${" "} ${" "} : ${" "}${JSONDTE.receptor.nrc}`,
    90
  );
  const nrcHeight = getHeightText(doc, nrcSplit);
  doc.text(nrcSplit, 125, text1Y2, {
    align: "left",
  });

  const text2Y2 = text1Y2 + nrcHeight + 1;
  const nitSplit = doc.splitTextToSize(
    `NIT ${" "} ${" "} ${" "} : ${" "}${JSONDTE.receptor.nit}`,
    120
  );
  const nitHeight = getHeightText(doc, nitSplit);
  doc.text(nitSplit, 125, text2Y2, { align: "left" });

  const text3Y2 = text2Y2 + nitHeight + 1;
  const codigoGen = doc.splitTextToSize(
    `CODIGO GENERACION ${" "} ${" "} : ${" "}${
      JSONDTE.identificacion.codigoGeneracion
    }`,
    120
  );
  const codigoGenHeight = getHeightText(doc, codigoGen);
  doc.text(codigoGen, 125, text3Y2, { align: "left" });

  const text4Y2 = text3Y2 + codigoGenHeight + 1;
  const numeroControl = doc.splitTextToSize(
    `NUMERO DE CONTROL ${" "} ${" "} : ${" "}${
      JSONDTE.identificacion.numeroControl
    }`,
    120
  );
  const numeroControlHeight = getHeightText(doc, numeroControl);
  doc.text(numeroControl, 125, text4Y2, { align: "left" });

  const text5Y2 = text4Y2 + numeroControlHeight + 1;
  const sello = doc.splitTextToSize(
    `SELLO ${" "} ${" "} : ${" "}${JSONDTE.respuestaMH.selloRecibido}`,
    120
  );
  const selloHeight = getHeightText(doc, sello);
  doc.text(sello, 125, text5Y2, { align: "left" });

  const text6Y2 = text5Y2 + selloHeight + 1;
  const fecHora = doc.splitTextToSize(
    `FECHA HORA EMISION ${" "} ${" "} : ${" "}${
      JSONDTE.identificacion.fecEmi
    }: ${JSONDTE.identificacion.horEmi}`,
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
    nitHeight +
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

  returnBoldText(
    doc,
    "OTROS DOCUMENTOS ASOCIADOS",
    100,
    lastElementHeight,
    "center"
  );

  doc.roundedRect(
    5,
    lastElementHeight + 2,
    doc.internal.pageSize.width - 10,
    10,
    2,
    2,
    "S"
  );

  autoTable(doc, {
    head: [["Identificación del documento", "Descripción"]],
    theme: "plain",
    headStyles: {
      fontSize: 7,
    },
    columnStyles: {
      0: {
        cellWidth: 60,
      },
    },
    body: [["", ""]],
    startY: lastElementHeight + 1,
  });

  let finalY = (
    doc as unknown as {
      lastAutoTable: { finalY: number };
    }
  ).lastAutoTable.finalY;

  returnBoldText(doc, "VENTA A CUENTA DE TERCEROS", 100, finalY, "center");

  doc.roundedRect(
    5,
    finalY + 2,
    doc.internal.pageSize.width - 10,
    10,
    2,
    2,
    "S"
  );

  autoTable(doc, {
    head: [["NIT", "Nombre, denominación o razón social"]],
    theme: "plain",
    headStyles: {
      fontSize: 7,
    },
    columnStyles: {
      0: {
        cellWidth: 60,
      },
    },
    body: [["", ""]],
    startY: finalY + 2,
  });

  finalY = (
    doc as unknown as {
      lastAutoTable: { finalY: number };
    }
  ).lastAutoTable.finalY;

  returnBoldText(doc, "DOCUMENTOS RELACIONADOS", 100, finalY, "center");

  doc.roundedRect(
    5,
    finalY + 2,
    doc.internal.pageSize.width - 10,
    12,
    2,
    2,
    "S"
  );

  autoTable(doc, {
    head: [["Tipo de Documento", "N° de Documento", "Fecha de Documento"]],
    theme: "plain",
    headStyles: {
      fontSize: 7,
    },
    columnStyles: {
      0: {
        cellWidth: 60,
      },
    },
    body: [
      [
        JSONDTE.identificacion.tipoDte === "01"
          ? "Factura Comercial"
          : "Comprobante de Crédito Fiscal",
        JSONDTE.identificacion.codigoGeneracion,
        JSONDTE.identificacion.fecEmi,
      ],
    ],
    bodyStyles: {
      fontSize: 7,
    },
    margin: {
      bottom: 5,
    },
    startY: finalY + 2,
  });

  finalY = (
    doc as unknown as {
      lastAutoTable: { finalY: number };
    }
  ).lastAutoTable.finalY;

  finalYFirtsPage = finalY;

  const headers = [
    "CANTIDAD",
    "DESCRIPCION",
    "PRECIO UNITARIO",
    "DESCUENTO POR ITEM",
    "OTROS MONTOS NO AFECTOS",
    "VENTAS NO SUJETAS",
    "VENTAS EXENTAS",
    "VENTAS GRAVADAS",
  ];

  const array_object: unknown[] = [];
  JSONDTE.cuerpoDocumento.map((prd) => {
    array_object.push(
      Object.values({
        qty: prd.cantidad,
        desc: prd.descripcion,
        price: formatCurrency(prd.precioUni),
        descu: formatCurrency(prd.montoDescu),
        other: formatCurrency(0),
        vtSuj: formatCurrency(prd.ventaNoSuj),
        vtExe: formatCurrency(prd.ventaExenta),
        vtGrav: formatCurrency(prd.ventaGravada),
      })
    );
  });

  autoTable(doc, {
    theme: "plain",
    startY: finalY + 5,
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
      1: { cellWidth: 65, cellPadding: 2 },
      2: {
        cellWidth: 20,
        cellPadding: 2,
      },
      3: {
        cellWidth: 20,
        cellPadding: 2,
      },
      4: {
        cellWidth: 20,
        cellPadding: 2,
      },
      5: {
        cellWidth: 20,
        cellPadding: 2,
      },
      6: { cellWidth: 20, cellPadding: 2 },
      7: { cellPadding: 2 },
    },
    headStyles: {
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      fontSize: 5,
    },
    bodyStyles: {
      fontSize: 7,
    },
  });
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    if (i !== 1) {
      headerDoc(doc, JSONDTE, img_logo);
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
    const docName = doc.splitTextToSize("NOTA DE CRÉDITO", 30);
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
      `N.I.T. ${JSONDTE.emisor.nit}`,
      doc.internal.pageSize.width - 25,
      33,
      "center"
    );
    returnBoldText(
      doc,
      `NRC No. ${JSONDTE.emisor.nrc}`,
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
      (i > 1 ? 50 : finalYFirtsPage + 5) -
      margin +
      (i > 1 ? 0 : pageCount > 1 ? 50 : 0);

    const rectMargin = doc.internal.pageSize.getHeight() - 50 - margin;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0, 0, 0);
    // doc.roundedRect(20, 50, 80, rectHeight, 0, 0, "S");
    doc.setFillColor("#ced4da");
    doc.roundedRect(
      85,
      i > 1 ? 50 : finalYFirtsPage + 5,
      20,
      rectHeight - 50,
      0,
      0,
      "S"
    );
    // doc.roundedRect(105, 50, 20, rectHeight, 0, 0, "S");
    doc.roundedRect(
      125,
      i > 1 ? 50 : finalYFirtsPage + 5,
      20,
      rectHeight - 50,
      0,
      0,
      "S"
    );
    // doc.roundedRect(145, 50, 20, rectHeight, 0, 0, "S");
    doc.roundedRect(
      165,
      i !== 1 ? 50 : finalYFirtsPage + 5,
      20,
      rectHeight - 50,
      0,
      0,
      "S"
    );
    doc.roundedRect(
      margin,
      i !== 1 ? 50 : finalYFirtsPage + 5,
      rectWidth,
      rectHeight - (i !== 1 ? 0 : pageCount === 1 ? 0 : 50),
      radius,
      radius,
      "S"
    );

    doc.setFillColor("#ced4da");
    doc.roundedRect(
      margin,
      i !== 1 ? 50 : finalYFirtsPage + 5,
      rectWidth,
      8,
      radius,
      radius,
      "FD"
    );
    autoTable(doc, {
      startY: i !== 1 ? 50 : finalYFirtsPage + 5,
      theme: "plain",
      head: [headers],
      columnStyles: {
        0: { cellWidth: 15, halign: "center", cellPadding: 2 },
        1: { cellWidth: 65, cellPadding: 2 },
        2: {
          cellWidth: 20,
          cellPadding: 2,
        },
        3: {
          cellWidth: 20,
          cellPadding: 2,
        },
        4: {
          cellWidth: 20,
          cellPadding: 2,
        },
        5: {
          cellWidth: 20,
          cellPadding: 2,
        },
        6: { cellWidth: 20, cellPadding: 2 },
        7: { cellPadding: 2 },
      },
      headStyles: {
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 5,
      },
      body: [["", "", "", "", "", "", ""]],
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
      footerDocument(doc, rectMargin, JSONDTE);
      doc.line(125, rectHeight + 50, 125, rectMargin + 7);
    }

    if (pageCount === 1 && 1 === 1) {
      doc.line(5, rectMargin, doc.internal.pageSize.getWidth() - 5, rectMargin);
      doc.line(
        5,
        rectMargin + 7,
        doc.internal.pageSize.getWidth() - 5,
        rectMargin + 7
      );
      footerDocument(doc, rectMargin, JSONDTE);
      doc.line(
        125,
        doc.internal.pageSize.height - 48,
        125,
        doc.internal.pageSize.height - 5
      );
    }
    if (isInvalid) {
      doc.saveGraphicsState();
      doc.setGState(doc.GState({ opacity: 0.3 }));
      doc.addImage(
        `data:image/png;base64,${imageBase64}`,
        "PNG",
        doc.internal.pageSize.width / 2 - 50,
        doc.internal.pageSize.height / 2,
        100,
        100,
        "FAST",
        "FAST"
      );
      doc.restoreGraphicsState();
    }
  }

  return doc.output("datauristring");
};

export const footerDocument = (
  doc: jsPDF,
  rectMargin: number,
  JSONDTE: SVFE_NC_Firmado
) => {
  const { resumen } = JSONDTE;
  doc.text(`${resumen.totalLetras}`, 10, rectMargin + 4);
  doc.text("SUMA DE VENTAS:", 120, rectMargin + 4);
  doc.text(`$${" "} ${" "} ${resumen.totalNoSuj}`, 145, rectMargin + 4);
  doc.text(`$${" "} ${" "} ${resumen.totalExenta}`, 165, rectMargin + 4);
  doc.text(`$${" "} ${" "} ${resumen.totalGravada}`, 185, rectMargin + 4);
  doc.setFontSize(6);
  returnBoldText(doc, "Responsable por parte del emisor:", 10, rectMargin + 15);

  returnBoldText(doc, "N° de Documento:", 10, rectMargin + 25);
  returnBoldText(doc, "Observaciones:", 10, rectMargin + 35);
  returnBoldText(
    doc,
    "Responsable por parte del receptor:",
    65,
    rectMargin + 15
  );

  returnBoldText(doc, "N° de Documento:", 65, rectMargin + 25);

  doc.text("Suma Total de Operaciones:", 127, rectMargin + 10);
  doc.text(
    "Monto global Desc., Rebajas y otros a ventas no sujetas: ",
    127,
    rectMargin + 13
  );
  doc.text(
    "Monto global Desc., Rebajas y otros a ventas exentas:",
    127,
    rectMargin + 16
  );
  doc.text(
    "Monto global Desc., Rebajas y otros a ventas gravadas:",
    127,
    rectMargin + 19
  );
  doc.text("IVA 13%: ", 127, rectMargin + 22);
  doc.text("Sub-Total: ", 127, rectMargin + 25);
  doc.text("Monto Total de la Operación: ", 127, rectMargin + 28);
  doc.text("Total Otros montos no afectos: ", 127, rectMargin + 31);
  doc.text("Total a Pagar: ", 127, rectMargin + 34);

  for (let i = 0; i < 9; i++) {
    doc.text("$", 185, rectMargin + i * 3 + 10);
  }

  const totals = [
    resumen.descuGravada.toFixed(2),
    resumen.descuNoSuj.toFixed(2),
    resumen.descuExenta.toFixed(2),
    resumen.descuGravada.toFixed(2),
    resumen.tributos
      .map((tr) => Number(tr.valor))
      .reduce((a, b) => a + b)
      .toFixed(2),
    resumen.subTotal.toFixed(2),
    resumen.montoTotalOperacion.toFixed(2),
    "0.00",
    resumen.montoTotalOperacion.toFixed(2),
  ];

  totals.forEach((total, index) => {
    doc.text(total, 202.5, rectMargin + index * 3 + 10, {
      align: "right",
    });
  });
};

export const headerDoc = (
  doc: jsPDF,
  JSONDTE: SVFE_NC_Firmado,
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
  const name = doc.splitTextToSize(`${JSONDTE.emisor.nombre}`, 90);
  const nameH = getHeightText(doc, name);
  returnBoldText(doc, name, 90, 20, "center");
  doc.setFontSize(6);
  const actEco = doc.splitTextToSize(
    `Actividad económica: ${JSONDTE.emisor.descActividad}`,
    75
  );

  const distActEco = nameH + 20.5;

  returnBoldText(doc, actEco, 90, distActEco, "center");
  const address = doc.splitTextToSize(
    `DIRECCION : ${JSONDTE.emisor.direccion.complemento} ${returnAddress(
      JSONDTE.emisor.direccion.departamento,
      JSONDTE.emisor.direccion.municipio
    )}, El Salvador`,
    70
  );

  const act = getHeightText(doc, actEco);

  const distAddress = distActEco + act + 0.5;

  returnBoldText(doc, address, 90, distAddress, "center");

  const tel = getHeightText(doc, address);

  const distTel = distAddress + tel + 0.5;

  returnBoldText(doc, `TEL: ${JSONDTE.emisor.telefono}`, 90, distTel, "center");
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
