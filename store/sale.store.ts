import { create } from "zustand";
import { SaleStore } from "../types/sale/sale_store.types";
import {
  get_paginated_sales,
  get_recent_sales,
  get_details_sales,
  get_sales_in_contingence,
} from "../services/sale.service";
import { ToastAndroid } from "react-native";
import { IPagination } from "@/types/GlobalTypes/Global.types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/plugins/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import { SVFC_CF_Firmado } from "@/types/svf_dte/cf.types";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { SVFC_FC_Firmado } from "@/types/svf_dte/fc.types";
import {
  save_electronic_invoice,
  save_electronic_tax_credit,
} from "@/plugins/DTE/ElectronicContingencySubtraction";
import { SPACES_BUCKET } from "@/utils/constants";

export const useSaleStore = create<SaleStore>((set, get) => ({
  pagination_sales: {} as IPagination,
  is_loading: false,
  sales: [],
  recentSales: [],
  sale_details: undefined,
  json_sale: undefined,
  is_loading_details: false,
  img_invalidation: null,
  img_logo: null,
  contingence_sales: [],

  async GetJsonSale(path) {
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: SPACES_BUCKET,
        Key: path,
      })
    );
    axios
      .get<SVFC_CF_Firmado>(url, {
        responseType: "json",
      })
      .then(({ data }) => {
        set({
          json_sale: {
            ...data,
            itemsCopy: data.cuerpoDocumento,
            indexEdited: [],
          },
        });
      })
      .catch(() => {
        set({
          json_sale: undefined,
        });
        ToastAndroid.show("Error al obtener el json", ToastAndroid.LONG);
      });
  },
  onGetSalesContingence(id) {
    get_sales_in_contingence(id)
      .then((res) => {
        set({
          contingence_sales: res.data.sales,
        });
      })
      .catch(() => {
        set({
          contingence_sales: [],
        });
      });
  },
  GetPaginatedSales: (id, page, limit, startDate, endDate, status) => {
    set({ is_loading: true });
    get_paginated_sales(id, page, limit, startDate, endDate, status)
      .then(({ data }) => {
        set({
          sales: data.sales,
          pagination_sales: {
            total: data.total,
            totalPag: data.totalPag,
            currentPag: data.currentPag,
            nextPag: data.nextPag,
            prevPag: data.prevPag,
            status: data.status,
            ok: data.ok,
          },
          is_loading: false,
        });
      })
      .catch(() => {
        set({
          sales: [],
          pagination_sales: {
            total: 0,
            totalPag: 0,
            currentPag: 0,
            nextPag: 0,
            prevPag: 0,
            status: 0,
            ok: false,
          },
          is_loading: false,
        });
        ToastAndroid.show("Error al obtener las ventas", ToastAndroid.LONG);
      });
  },
  GetRecentSales(id) {
    get_recent_sales(id)
      .then(({ data }) => {
        set((state) => ({ ...state, recentSales: data.sales }));
      })
      .catch(() => {
        set((state) => ({ ...state, recentSales: [] }));
      });
  },
  GetSaleDetails(id) {
    set({ is_loading_details: true });
    get_details_sales(id)
      .then(({ data }) => {
        get().GetJsonSale(data.sale.pathJson);
        set({
          sale_details: {
            ...data.sale,
            details: data.sale.details
              ? data.sale.details.map((detail) => ({
                  ...detail,
                }))
              : [],
          },
          is_loading_details: false,
        });
      })
      .catch(() => {
        set({ sale_details: undefined, is_loading_details: false });
        ToastAndroid.show("Error al obtener la venta", ToastAndroid.LONG);
      });
  },
  UpdateSaleDetails: (data) => set({ json_sale: data }),
  OnImgPDF: async (extLogo) => {
    console.log("12");
    const image_invalidation = require("../assets/images/logo/DTE_NO_VALIDO.png");
    const image_logo = extLogo;
    try {
      // Carga el asset utilizando expo-asset
      const [asset_invalidation, asset_logo] = await Promise.all([
        Asset.fromModule(image_invalidation).downloadAsync(),
        Asset.fromModule(image_logo).downloadAsync(),
      ]);
      // const asset = Asset.fromModule(image_invalidation);
      // await asset.downloadAsync();

      // Verifica el URI del asset
      // const assetUri = asset.localUri || asset.uri;
      const assetUri_invalidation =
        asset_invalidation.localUri || asset_invalidation.uri;
      const assetUri_logo = asset_logo.localUri || asset_logo.uri;

      // Lee el archivo en base64
      // const base64String = await FileSystem.readAsStringAsync(assetUri, {
      //   encoding: FileSystem.EncodingType.Base64,
      // });
      const [base64String_invalidation, base64String_logo] = await Promise.all([
        FileSystem.readAsStringAsync(assetUri_invalidation, {
          encoding: FileSystem.EncodingType.Base64,
        }),
        FileSystem.readAsStringAsync(assetUri_logo, {
          encoding: FileSystem.EncodingType.Base64,
        }),
      ]);
      set((state) => ({
        ...state,
        img_invalidation: base64String_invalidation,
        img_logo: base64String_logo,
      }));
      // setImageBase64(base64String);
    } catch (err) {
      ToastAndroid.show("Error al cargar la imagen", ToastAndroid.LONG);
    }
  },
  async OnPressAllSalesConting(transmitter, saleDTE, pathJso, token_mh) {
    if (saleDTE === "01") {
      const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: SPACES_BUCKET,
          Key: pathJso,
        })
      );
      return axios
        .get<SVFC_FC_Firmado>(url, {
          responseType: "json",
        })
        .then(async ({ data }) => {
          return save_electronic_invoice(transmitter, token_mh, data);
        })
        .catch((error) => {
          ToastAndroid.show("No se encontró el documento", ToastAndroid.LONG);
          return {
            ok: false,
            isErrorMh: false,
            title: error.title,
            message: error.message,
          };
        });
    } else if (saleDTE === "03") {
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
          return save_electronic_tax_credit(
            transmitter,
            token_mh,

            data
          );
        })
        .catch((error) => {
          ToastAndroid.show("No se encontró el documento", ToastAndroid.LONG);
          return {
            ok: false,
            isErrorMh: false,
            title: error.title,
            message: error.message,
          };
        });
    } else if (saleDTE === "05") {
    } else if (saleDTE === "06") {
    } else if (saleDTE === "14") {
    } else {
      ToastAndroid.show("No se encontró el documento", ToastAndroid.LONG);
    }
  },
}));
