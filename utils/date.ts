import moment from "moment";
import { ToastAndroid } from "react-native";

export const formatDate = () => {
  const date = new Date();
  const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
  const month =
    date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
  return `${date.getFullYear()}-${month}-${day}`;
};

export const returnDate = (date: Date): string => {
  date.setDate(date.getDate());
  return (
    date.getFullYear() +
    "-" +
    (date.getMonth() > 8 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) +
    "-" +
    (date.getDate() > 9 ? date.getDate() : "0" + date.getDate())
  );
};
export function getElSalvadorDateTime(): { fecEmi: string; horEmi: string } {
  const elSalvadorTimezone = "America/El_Salvador";
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: elSalvadorTimezone,
  };

  const dateObj = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", dateOptions).format(
    dateObj
  );

  const [datePart, timePart] = formattedDate.split(", ");

  const [month, day, year] = datePart.split("/");

  const formattedDatePart = `${year}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}`;

  return { fecEmi: formattedDatePart, horEmi: timePart };
}
export function verifyApplyAnulation(tipoDte: string, date: string) {
  const fechaDTEParseada = moment(date, "YYYY-MM-DD");
  if (!fechaDTEParseada.isValid()) {
    ToastAndroid.show("Fecha inválida", ToastAndroid.LONG);
    return false;
  }
  const fechaActual = moment();
  const daysDiference = fechaActual.diff(fechaDTEParseada, "days");
  if (tipoDte === "01") {
    const daysLimit = 90;
    if (daysDiference > daysLimit) {
      ToastAndroid.show(
        "DTE fuera del plazo de disponibilidad (3 meses)",
        ToastAndroid.LONG
      );
      return false;
    }
    return true;
  } else if (tipoDte === "03" || tipoDte === "06" || tipoDte === "05") {
    const daysLimit = 1;
    if (daysDiference > daysLimit) {
      ToastAndroid.show(
        "DTE fuera del plazo de disponibilidad (1 día)",
        ToastAndroid.LONG
      );

      return false;
    }
    return true;
  } else {
    ToastAndroid.show("Tipo de DTE inválido", ToastAndroid.LONG);

    return false;
  }
}
export function getElSalvadorDateTimeParam(date: Date): {
  fecEmi: string;
  horEmi: string;
} {
  const elSalvadorTimezone = "America/El_Salvador";
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: elSalvadorTimezone,
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", dateOptions).format(
    date
  );

  // Split the formatted date into date and time parts
  const [datePart, timePart] = formattedDate.split(", ");

  // Split the date into its components (month, day, year)
  const [month, day, year] = datePart.split("/");

  // Reformat the date to yyyy-mm-dd format
  const formattedDatePart = `${year}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}`;

  return { fecEmi: formattedDatePart, horEmi: timePart };
}

export const validateDays = (days: string[]) => {
  const today = new Date().toLocaleString("en-US", { weekday: "long" });

  if (days.includes(today)) {
    return true;
  } else {
    return false;
  }
};
