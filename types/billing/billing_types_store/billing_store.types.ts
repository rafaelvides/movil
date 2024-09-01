import { ITiposDeContingencia } from "../../../types/billing/cat-005-tipos-de-contigencia.types";
import { Departamento } from "../../../types/billing/cat-012-departamento.types";
import { Municipio } from "../../../types/billing/cat-013-municipio.types";
import { IUnitOfMeasurement } from "../../../types/billing/cat-014-tipos-de-medida.types";
import { ICodigoActividadEconomica } from "../../../types/billing/cat-019-codigo-de-actividad-economica.types";
import { ICat002TipoDeDocumento } from "../../../types/billing/cat-002-tipo-de-documento.types";
import { IAmbienteDestino } from "../../../types/billing/cat-001-ambiente-de-destino.types";
import { IFormasDePago } from "../../../types/billing/cat-017-forma-de-pago.types";
import { ICat022TipoDeDocumentoDeIde } from "../../../types/billing/cat-022-tipo-de-documento-de-ide.types";
import { ITipoTributo } from "../../../types/billing/cat-015-tipo-de-tributo.types";
import { ICondicionDeLaOperacion } from "../cat-016-condicion-de-la-operacion.types";
import { IPlazo } from "../cat-018-plazo.types";
import { ITipoDeInvalidacion } from "../cat-024-tipo-de-invalidacion.types";

export interface IBillingStore {
  cat_012_departamento: Departamento[];
  cat_013_municipios: Municipio[];
  cat_019_codigo_de_actividad_economica: ICodigoActividadEconomica[];
  cat_005_tipo_de_contingencia: ITiposDeContingencia[];
  cat_014_unidad_de_medida: IUnitOfMeasurement[];
  cat_022_tipo_de_documento_de_ide: ICat022TipoDeDocumentoDeIde[];
  cat_001_ambiente_de_destino: IAmbienteDestino[];
  cat_017_forma_de_pago: IFormasDePago[];
  cat_002_tipos_de_documento: ICat002TipoDeDocumento[];
  cat_015_tipos_tributo: ITipoTributo[];
  cat_016_condicion_de_la_operacion: ICondicionDeLaOperacion[];
  cat_018_plazo: IPlazo[];
  cat_024_tipos_de_invalidacion: ITipoDeInvalidacion[];

  OnGetCat005TipoDeContingencia: () => void;
  OnGetCat012Departamento: () => void;
  OnGetCat013Municipios: (depCode: string) => void;
  OnGetCat014UnidadDeMedida: () => void;
  OnGetCat019CodigoActividadEconomica: (name?: string) => void;
  OnGetCat022TipoDeDocumentoDeIde: (name?: string) => void;
  OnGetCat015TiposTributos: () => void;
  OnGetCat02TipoDeDocumento: () => void;
  OnGetCat017FormasDePago: () => void;
  OnGetCat001AmbienteDestino: () => void;
  OnGetCat016CondicionDeLaOperacio: () => void;
  OnGetCat018Plazo: () => void;
  OnGetCat024TipoDeLaInvalidacion: () => void;
}
