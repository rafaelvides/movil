import { create } from "zustand";
import { IBillingStore } from "../../types/billing/billing_types_store/billing_store.types";
import { SeedcodeCatalogosMhService } from "seedcode-catalogos-mh";

const service = new SeedcodeCatalogosMhService();

export const useBillingStore = create<IBillingStore>((set) => ({
  cat_012_departamento: [],
  cat_013_municipios: [],
  cat_019_codigo_de_actividad_economica: [],
  cat_001_ambiente_de_destino: [],
  cat_017_forma_de_pago: [],
  cat_002_tipos_de_documento: [],
  cat_014_unidad_de_medida: [],
  cat_015_tipos_tributo: [],
  cat_005_tipo_de_contingencia: [],
  cat_022_tipo_de_documento_de_ide: [],
  cat_016_condicion_de_la_operacion: [],
  cat_018_plazo: [],
  cat_024_tipos_de_invalidacion: [],
  OnGetCat005TipoDeContingencia() {
    set({
      cat_005_tipo_de_contingencia: service
        .get005TipoDeContingencum()
        .map((item) => ({ ...item, isActivated: item.isActivated === 1 })),
    });
  },
  OnGetCat012Departamento: () => {
    set({
      cat_012_departamento: service
        .get012Departamento()
        .map((item) => ({ ...item, isActivated: item.isActivated === 1 })),
    });
  },
  OnGetCat013Municipios(depCode) {
    const municipios = service.get013Municipio(depCode);
    if (municipios) {
      set({
        cat_013_municipios: municipios.map((item) => ({
          ...item,
          isActivated: item.isActivated === 1,
        })),
      });
    }
  },
  OnGetCat019CodigoActividadEconomica(name) {
    set({
      cat_019_codigo_de_actividad_economica: service
        .get019CodigoDeActividaEcono(name)
        .map((item) => ({ ...item, isActivated: item.isActivated === 1 })),
    });
  },

  OnGetCat022TipoDeDocumentoDeIde() {
    set({
      cat_022_tipo_de_documento_de_ide: service
        .get022TipoDeDocumentoDeIde()
        .map((item) => ({ ...item, isActivated: item.isActivated === 1 })),
    });
  },
  OnGetCat015TiposTributos() {
    set({
      cat_015_tipos_tributo: service
        .get015Tributo()
        .map((item) => ({ ...item, isActivated: item.isActivated === 1 })),
    });
  },
  OnGetCat001AmbienteDestino() {
    set({
      cat_001_ambiente_de_destino: service
        .get001AmbienteDeDestino()
        .map((item) => ({ ...item, isActivated: item.isActivated === 1 })),
    });
  },
  OnGetCat017FormasDePago() {
    set({
      cat_017_forma_de_pago: service
        .get017FormaDePago()
        .map((item) => ({ ...item, isActivated: item.isActivated === 1 })),
    });
  },
  OnGetCat02TipoDeDocumento() {
    set({
      cat_002_tipos_de_documento: service
        .get002TipoDeDocumento()
        .map((item) => ({ ...item, isActivated: item.isActivated === 1 })),
    });
  },
  OnGetCat014UnidadDeMedida() {
    set({
      cat_014_unidad_de_medida: service
        .get014UnidadDeMedida()
        .map((item) => ({ ...item, isActivated: item.isActivated === 1 })),
    });
  },
  OnGetCat016CondicionDeLaOperacio() {
    set({
      cat_016_condicion_de_la_operacion: service
        .get016CondicionDeLaOperacio()
        .map((item) => ({ ...item, isActivated: item.isActivated === 1 })),
    });
  },
  OnGetCat018Plazo() {
    set({
      cat_018_plazo: service.get018Plazo().map((item) => ({
        ...item,
        isActivated: item.isActivated === 1,
      })),
    });
  },
  OnGetCat024TipoDeLaInvalidacion() {
    set({
      cat_024_tipos_de_invalidacion: service
        .get024TipoDeInvalidacion()
        .map((item) => ({ ...item, isActivated: item.isActivated === 1 })),
    });
  },
}));
