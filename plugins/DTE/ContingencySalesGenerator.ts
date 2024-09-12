import { IContingencySales } from "@/types/svf_dte/ContingencySales.types";
import { ITransmitter } from "@/types/transmitter/transmiter.types";
import { ambiente } from "@/utils/constants";
import { generate_uuid } from "../random/random";
import {
  getElSalvadorDateTime,
  getElSalvadorDateTimeParam,
} from "@/utils/date";
import { IPointOfSaleCorrelatives } from "@/types/point_of_sales/pointOfSales.types";
import { IEmployee } from "@/types/employee/employee.types";

export const ContingencySalesGenerator = (
  transmitter: ITransmitter,
  startDate: string,
  time: string,
  endDate: string,
  endTime: string,
  codeConting: number,
  reasonConting: string,
  infoSales: {
    noItem: number;
    codigoGeneracion: string;
    tipoDoc: string;
  }[],
  correlative: IPointOfSaleCorrelatives,
  employee: IEmployee
): IContingencySales => {
  return {
    nit: transmitter.nit,
    activo: true,
    passwordPri: transmitter.clavePrivada,
    dteJson: {
      identificacion: {
        version: 3,
        ambiente: ambiente,
        codigoGeneracion: generate_uuid().toUpperCase(),
        fTransmision: getElSalvadorDateTime().fecEmi,
        hTransmision: getElSalvadorDateTime().horEmi,
      },
      emisor: {
        nit: transmitter.nit,
        nombre: transmitter.nombre,
        nombreResponsable: employee.fullName,
        tipoDocResponsable: employee.typeDocument,
        numeroDocResponsable: employee.numDocument,
        tipoEstablecimiento: correlative.tipoEstablecimiento,
        telefono: transmitter.telefono,
        correo: transmitter.correo,
        codEstableMH: null,
        codPuntoVenta:
          correlative.codPuntoVenta === "0" ||
          correlative.codEstableMH === "N/A"
            ? null
            : correlative.codPuntoVenta,
      },
      detalleDTE: infoSales,
      motivo: {
        fInicio: startDate,
        fFin: endDate,
        hInicio: time,
        hFin: endTime,
        tipoContingencia: codeConting,
        motivoContingencia: reasonConting === "" ? null : reasonConting,
      },
    },
  };
};
