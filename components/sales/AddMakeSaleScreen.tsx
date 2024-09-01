import { useEffect, useState, Dispatch, SetStateAction, useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Pressable,
  ToastAndroid,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { StatusBar } from "expo-status-bar";
import { useCustomerStore } from "@/store/customer.store";
import { useBillingStore } from "@/store/billing/billing.store";
import { ICustomer } from "@/types/customer/customer.types";
import { IFormasDePagoResponse } from "@/types/billing/cat-017-forma-de-pago.types";
import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
import { ITipoTributo } from "@/types/billing/cat-015-tipo-de-tributo.types";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ICondicionDeLaOperacion } from "@/types/billing/cat-016-condicion-de-la-operacion.types";

interface Props {
  customer: ICustomer | undefined;
  setCustomer: Dispatch<SetStateAction<ICustomer | undefined>>;
  typeDocument: ICat002TipoDeDocumento | undefined;
  setTypeDocument: Dispatch<SetStateAction<ICat002TipoDeDocumento>>;
  typeTribute: ITipoTributo | undefined;
  setTypeTribute: Dispatch<SetStateAction<ITipoTributo>>;
  handleAddPay: () => void;
  onUpdatePeriodo: (index: number, value: number) => void;
  onUpdateMonto: (index: number, value: number) => void;
  handleUpdatePlazo: (index: number, value: string) => void;
  handleUpdateTipoPago: (index: number, value: string) => void;
  setConditionPayment: Dispatch<SetStateAction<ICondicionDeLaOperacion>>;
  handleRemovePay: (index: number) => void;
  setFocusButton: Dispatch<SetStateAction<boolean>>;
  conditionPayment: ICondicionDeLaOperacion;
  pays: IFormasDePagoResponse[];
  totalUnformatted: number;
  totalPagarIva: number;
  total: string;
}
const AddMakeSaleScreen = (props: Props) => {
  const {
    setCustomer,
    handleRemovePay,
    handleAddPay,
    customer,
    pays,
    handleUpdatePlazo,
    onUpdatePeriodo,
    onUpdateMonto,
    handleUpdateTipoPago,
    setConditionPayment,
    setTypeDocument,
    conditionPayment,
    totalUnformatted,
    setFocusButton,
    typeDocument,
    typeTribute,
    totalPagarIva,
  } = props;

  const [isFocus, setIsFocus] = useState(false);
  const [isFocusPago, setIsFocusPago] = useState(false);
  const [isFocusTipoDocum, setIsFocusTipoDocum] = useState(false);
  const [isFocusTipoConditions, setIsFocusTipoConditions] = useState(false);
  const [isFocusTributo, setIsFocusTributo] = useState(false);
  const [conditions, setConditions] = useState(0);
  const [typePayment, setTypePayment] = useState({
    codigo: "01",
    id: 1,
    isActivated: true,
    valores: "Billetes y monedas",
  });
  const { OnGetCustomersList, customer_list } = useCustomerStore();
  const {
    OnGetCat017FormasDePago,
    cat_017_forma_de_pago,
    OnGetCat02TipoDeDocumento,
    cat_002_tipos_de_documento,
    OnGetCat015TiposTributos,
    cat_015_tipos_tributo,
    OnGetCat016CondicionDeLaOperacio,
    cat_016_condicion_de_la_operacion,
    OnGetCat018Plazo,
    cat_018_plazo,
  } = useBillingStore();
  useEffect(() => {
    OnGetCustomersList();
    OnGetCat017FormasDePago();
    OnGetCat02TipoDeDocumento();
    OnGetCat015TiposTributos();
    OnGetCat016CondicionDeLaOperacio();
    OnGetCat018Plazo();
  }, []);
  const [vuelto, setVuelto] = useState(0);
  const [stateMonts, setStateMonts] = useState(false);
  const handlePagoChange = (pagoValue: string) => {
    const pagoNumber = Number(pagoValue);
    const vuelto = pagoNumber - Number(totalUnformatted);
    setVuelto(vuelto);
  };
  //----total for each card------
  const numCards = pays.length;

  let baseAmount = totalUnformatted / numCards;
  let baseAmountIva = totalPagarIva / numCards;

  let amountsToPay = pays.map((_, index) => {
    return parseFloat(baseAmount.toFixed(2));
  });
  let amountsToPayIva = pays.map((_, index) => {
    return parseFloat(baseAmountIva.toFixed(2));
  });

  let sumSoFar = amountsToPay.reduce((acc, amount) => acc + amount, 0);
  let sumSoFarIva = amountsToPayIva.reduce((acc, amount) => acc + amount, 0);

  let difference = totalUnformatted - sumSoFar;
  let differenceIva = totalPagarIva - sumSoFarIva;

  amountsToPay[amountsToPay.length - 1] += difference;
  amountsToPayIva[amountsToPayIva.length - 1] += differenceIva;

  const handleMounts = () => {
    if (baseAmount <= 6) {
      ToastAndroid.show("Has llegado al mínimo del monto", ToastAndroid.LONG);
      setStateMonts(true);
    }
  };
  if (baseAmount > 5 && stateMonts === true) {
    setStateMonts(false);
  }
  const defaultDocument = useMemo(() => {
    return cat_002_tipos_de_documento.filter((doc) =>
      ["01", "03"].includes(doc.codigo)
    );
  }, [cat_002_tipos_de_documento]);

  const defaultCustomerKey = useMemo(() => {
    if (!customer) {
      setCustomer(customer_list.length > 0 ? customer_list[0] : undefined);
      return customer_list.length > 0 ? customer_list[0] : undefined;
    }
  }, [customer_list]);
  return (
  <></>
  );
};

export default AddMakeSaleScreen;

const styles = StyleSheet.create({
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  card: {
    marginBottom: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    padding: 6,
    margin: 3,
  },
  input: {
    height: 45,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 5,
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  inputObservcation: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginTop: 10,
  },
});
