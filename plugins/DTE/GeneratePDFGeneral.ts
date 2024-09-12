import { ISale_JSON_Debito } from "@/types/sale/sale.types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import { SVFC_CF_Firmado } from "@/types/svf_dte/cf.types";
import jsPDF from "jspdf";
import { QR_URL } from "./make_generator/qr_generate";
import { generateFacturaComercial } from "../templates/template_fe";
import { SVFC_FC_Firmado } from "@/types/svf_dte/fc.types";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { generateCreditoFiscal } from "../templates/template_cf";
import { SVFE_NC_Firmado, SVFE_NC_SEND } from "@/types/svf_dte/nc.types";
import { generateNotaCredito } from "./ElectronicCreditNote";
import { makeNotaCreditoPDF } from "../templates/template_noteCredit";
import { makeNotaDebitoPDF } from "../templates/template_MemoDebit";
import { SVFE_ND_Firmado, SVFE_ND_SEND } from "@/types/svf_dte/nd.types";
import { makePDFSujetoExcluido } from "../templates/template_excludedSubject";
import { SVFE_FSE_Firmado, SVFE_FSE_SEND } from "@/types/svf_dte/fse.types";
import { ToastAndroid } from "react-native";
import { IProcessPDF } from "@/types/svf_dte/responseMH/responseMH.types";
import { SPACES_BUCKET } from "@/utils/constants";

export const generate_json = async (
  pathJso: string,
  SaleDte: string,
  img_invalidation: string | null,
  img_logo: string,
  invalidated: boolean,
  codigoGeneracion: string
): Promise<IProcessPDF | undefined> => {
  if (SaleDte === "01") {
    try {
      const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: SPACES_BUCKET,
          Key: pathJso,
        })
      );
      return await axios
        .get<SVFC_FC_Firmado>(url, {
          responseType: "json",
        })
        .then(async ({ data }) => {
          const doc = new jsPDF();
          const QR = QR_URL(
            data.identificacion.codigoGeneracion,
            data.identificacion.fecEmi
          );
          const blobQR = await axios.get<ArrayBuffer>(QR, {
            responseType: "arraybuffer",
          });
          const document_gen = generateFacturaComercial(
            doc,
            data,
            new Uint8Array(blobQR.data),
            img_invalidation,
            img_logo,
            invalidated
          );
          const filePath = `${FileSystem.documentDirectory}${codigoGeneracion}.pdf`;
          await FileSystem.writeAsStringAsync(
            filePath,
            document_gen.replace(
              /^data:application\/pdf;filename=generated\.pdf;base64,/,
              ""
            ),
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          const contentUri = await FileSystem.getContentUriAsync(filePath);
          await IntentLauncher.startActivityAsync(
            "android.intent.action.VIEW",
            {
              data: contentUri,
              flags: 1,
              type: "application/pdf",
            }
          );
          return {
            ok: true,
            message: "Se generó correctamente el pdf",
          };
        })
        .catch((error) => {
          return {
            ok: false,
            message: "Error en la generación del pdf",
          };
        })
    } catch (error) {
      ToastAndroid.show(
        "Ocurrió un error al generar el pdf",
        ToastAndroid.LONG
      );
      return {
        ok: false,
        message: `Ocurrió un error al generar el pdf ${error}`,
      };
    }
  } else if (SaleDte === "03") {
    try {
      const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: SPACES_BUCKET,
          Key: pathJso,
        })
      );
      return axios
        .get<SVFC_CF_Firmado>(url, {
          responseType: "json",
        })
        .then(async ({ data }) => {
          const doc = new jsPDF();
          const QR = QR_URL(
            data.identificacion.codigoGeneracion,
            data.identificacion.fecEmi
          );
          const blobQR = await axios.get<ArrayBuffer>(QR, {
            responseType: "arraybuffer",
          });
          const document_gen = generateCreditoFiscal(
            doc,
            data,
            new Uint8Array(blobQR.data),
            img_invalidation,
            img_logo,
            invalidated
          );
          const filePath = `${FileSystem.documentDirectory}${codigoGeneracion}.pdf`;
          await FileSystem.writeAsStringAsync(
            filePath,
            document_gen.replace(
              /^data:application\/pdf;filename=generated\.pdf;base64,/,
              ""
            ),
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          const contentUri = await FileSystem.getContentUriAsync(filePath);
          await IntentLauncher.startActivityAsync(
            "android.intent.action.VIEW",
            {
              data: contentUri,
              flags: 1,
              type: "application/pdf",
            }
          );
          return {
            ok: true,
            message: "Se generó correctamente el pdf",
          };
        });
    } catch (error) {
      ToastAndroid.show(
        "Ocurrió un error al generar el pdf",
        ToastAndroid.LONG
      );
      return {
        ok: false,
        message: `Ocurrió un error al generar el pdf ${error}`,
      };
    }
  } else if (SaleDte == "05") {
    try {
      const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: SPACES_BUCKET,
          Key: pathJso,
        })
      );
      axios
        .get<SVFE_NC_Firmado>(url, {
          responseType: "json",
        })
        .then(async ({ data }) => {
          const doc = new jsPDF();
          const QR = QR_URL(
            data.identificacion.codigoGeneracion,
            data.identificacion.fecEmi
          );
          const blobQR = await axios.get<ArrayBuffer>(QR, {
            responseType: "arraybuffer",
          });
          const document_gen = makeNotaCreditoPDF(
            doc,
            data,
            new Uint8Array(blobQR.data),
            img_invalidation,
            img_logo,
            invalidated
          );
          const filePath = `${FileSystem.documentDirectory}${codigoGeneracion}.pdf`;
          await FileSystem.writeAsStringAsync(
            filePath,
            document_gen.replace(
              /^data:application\/pdf;filename=generated\.pdf;base64,/,
              ""
            ),
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          const contentUri = await FileSystem.getContentUriAsync(filePath);
          await IntentLauncher.startActivityAsync(
            "android.intent.action.VIEW",
            {
              data: contentUri,
              flags: 1,
              type: "application/pdf",
            }
          );
          return {
            ok: true,
            message: "Se generó correctamente el pdf",
          };
        });
    } catch (error) {
      ToastAndroid.show(
        "Ocurrió un error al generar el pdf",
        ToastAndroid.LONG
      );
      return {
        ok: false,
        message: `Ocurrió un error al generar el pdf ${error}`,
      };
    }
  } else if (SaleDte == "06") {
    //nota de debito
    try {
      const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: SPACES_BUCKET,
          Key: pathJso,
        })
      );
      axios
        .get<SVFE_ND_Firmado>(url, {
          responseType: "json",
        })
        .then(async ({ data }) => {
          const doc = new jsPDF();
          const QR = QR_URL(
            data.identificacion.codigoGeneracion,
            data.identificacion.fecEmi
          );
          const blobQR = await axios.get<ArrayBuffer>(QR, {
            responseType: "arraybuffer",
          });
          const document_gen = makeNotaDebitoPDF(
            doc,
            data,
            new Uint8Array(blobQR.data),
            img_invalidation,
            img_logo,
            invalidated
          );
          const filePath = `${FileSystem.documentDirectory}${codigoGeneracion}.pdf`;
          await FileSystem.writeAsStringAsync(
            filePath,
            document_gen.replace(
              /^data:application\/pdf;filename=generated\.pdf;base64,/,
              ""
            ),
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          const contentUri = await FileSystem.getContentUriAsync(filePath);
          await IntentLauncher.startActivityAsync(
            "android.intent.action.VIEW",
            {
              data: contentUri,
              flags: 1,
              type: "application/pdf",
            }
          );
          return {
            ok: true,
            message: "Se generó correctamente el pdf",
          };
        });
    } catch (error) {
      ToastAndroid.show(
        "Ocurrió un error al generar el pdf",
        ToastAndroid.LONG
      );
      return {
        ok: false,
        message: `Ocurrió un error al generar el pdf ${error}`,
      };
    }
  } else if (SaleDte == "14") {
    try {
      const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: SPACES_BUCKET,
          Key: pathJso,
        })
      );
      axios
        .get<SVFE_FSE_Firmado>(url, {
          responseType: "json",
        })
        .then(async ({ data }) => {
          const doc = new jsPDF();
          const QR = QR_URL(
            data.identificacion.codigoGeneracion,
            data.identificacion.fecEmi
          );
          const blobQR = await axios.get<ArrayBuffer>(QR, {
            responseType: "arraybuffer",
          });
          const document_gen = makePDFSujetoExcluido(
            doc,
            data,
            new Uint8Array(blobQR.data),
            img_invalidation,
            img_logo,
            invalidated
          );
          const filePath = `${FileSystem.documentDirectory}${codigoGeneracion}.pdf`;
          await FileSystem.writeAsStringAsync(
            filePath,
            document_gen.replace(
              /^data:application\/pdf;filename=generated\.pdf;base64,/,
              ""
            ),
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          const contentUri = await FileSystem.getContentUriAsync(filePath);
          await IntentLauncher.startActivityAsync(
            "android.intent.action.VIEW",
            {
              data: contentUri,
              flags: 1,
              type: "application/pdf",
            }
          );
          return {
            ok: true,
            message: "Se generó correctamente el pdf",
          };
        });
    } catch (error) {
      ToastAndroid.show(
        "Ocurrió un error al generar el pdf",
        ToastAndroid.LONG
      );
      return {
        ok: false,
        message: `Ocurrió un error al generar el pdf ${error}`,
      };
    }
  } else {
    ToastAndroid.show(
      `No se encontró un pdf para ${SaleDte}`,
      ToastAndroid.LONG
    );
    return {
      ok: false,
      message: ``,
    };
  }
};
