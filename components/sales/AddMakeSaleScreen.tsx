import {
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useMemo,
  useContext,
} from "react";
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
import Card from "../Global/components_app/Card";
import Input from "../Global/components_app/Input";
import stylesGlobals from "../Global/styles/StylesAppComponents";
import Button from "../Global/components_app/Button";
import { ThemeContext } from "@/hooks/useTheme";
import { useEmployeeStore } from "@/store/employee.store";
import { IEmployee } from "@/types/employee/employee.types";
import { formatCurrency } from "@/utils/dte";

interface Props {
  customer: ICustomer | undefined;
  setCustomer: Dispatch<SetStateAction<ICustomer | undefined>>;
  employee: IEmployee | undefined;
  setEmployee: Dispatch<SetStateAction<IEmployee | undefined>>;
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
    employee,
    pays,
    handleUpdatePlazo,
    onUpdatePeriodo,
    onUpdateMonto,
    handleUpdateTipoPago,
    setConditionPayment,
    setTypeDocument,
    setEmployee,
    conditionPayment,
    totalUnformatted,
    setFocusButton,
    typeDocument,
    typeTribute,
    totalPagarIva,
  } = props;

  const [isFocus, setIsFocus] = useState(false);
  const [isFocusEmp, setIsFocusEmp] = useState(false);
  const [isFocusPago, setIsFocusPago] = useState(false);
  const [isFocusTipoDocum, setIsFocusTipoDocum] = useState(false);
  const [isFocusTipoConditions, setIsFocusTipoConditions] = useState(false);
  const [details, setDetails] = useState(false);
  const [isFocusTributo, setIsFocusTributo] = useState(false);
  const [conditions, setConditions] = useState(0);
  const [typePayment, setTypePayment] = useState({
    codigo: "01",
    id: 1,
    isActivated: true,
    valores: "Billetes y monedas",
  });
  const { employee_list } = useEmployeeStore();

  const { customer_list } = useCustomerStore();
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
    OnGetCat017FormasDePago();
    OnGetCat02TipoDeDocumento();
    OnGetCat015TiposTributos();
    OnGetCat016CondicionDeLaOperacio();
    OnGetCat018Plazo();
  }, []);
  const { theme } = useContext(ThemeContext);

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

  return (
    <>
      <StatusBar style="light" />
      {!details ? (
        <View style={{ width: "100%" }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: "50%" }}>
              <Input
                placeholder={
                  typeDocument?.codigo === "01"
                    ? totalUnformatted.toFixed(2)
                    : totalPagarIva.toFixed(2)
                }
                onFocus={() => {
                  setFocusButton(true);
                }}
                onChangeText={(text) => {
                  handlePagoChange(text);
                }}
                handleBlur={() => {
                  setFocusButton(false);
                }}
                keyboardType="numeric"
                icon="currency-usd"
              />
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginLeft: "5%",
              }}
            >
              <Text>
                Vuelto: {vuelto >= 0 ? formatCurrency(vuelto) : "$0.00"}
              </Text>
            </View>
          </View>
          <View style={{ width: "100%", marginTop: 20 }}>
            <Text style={stylesGlobals.textInput}>Cliente a facturar</Text>
            <SafeAreaView
              style={{
                width: "100%",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                padding: 12,
                borderRadius: 15,
              }}
            >
              <Dropdown
                style={[isFocus && { borderColor: "blue" }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={customer_list}
                itemTextStyle={{
                  fontSize: 16,
                }}
                confirmSelectItem={true}
                search
                maxHeight={250}
                labelField="nombre"
                valueField="id"
                placeholder={!isFocus ? "Selecciona un item " : "..."}
                searchPlaceholder="Escribe para buscar..."
                value={customer}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(item) => {
                  setCustomer(item);
                  setIsFocus(false);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color={isFocus ? "blue" : "black"}
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </SafeAreaView>
          </View>
          <View style={{ width: "100%", marginTop: 20 }}>
            <Text style={stylesGlobals.textInput}>Empleado de la venta</Text>
            <SafeAreaView
              style={{
                width: "100%",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                padding: 12,
                borderRadius: 15,
              }}
            >
              <Dropdown
                style={[isFocusEmp && { borderColor: "blue" }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={employee_list}
                itemTextStyle={{
                  fontSize: 16,
                }}
                search
                maxHeight={250}
                labelField="fullName"
                valueField="id"
                placeholder={!isFocusEmp ? "Selecciona un item " : "..."}
                searchPlaceholder="Escribe para buscar..."
                value={employee}
                onFocus={() => setIsFocusEmp(true)}
                onBlur={() => setIsFocusEmp(false)}
                onChange={(item) => {
                  setEmployee(item);
                  setIsFocusEmp(false);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color={isFocusEmp ? "blue" : "black"}
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </SafeAreaView>
          </View>
          <View style={{ width: "100%", marginTop: 20 }}>
            <Text style={stylesGlobals.textInput}>
              Condición de la operación
            </Text>
            <SafeAreaView
              style={{
                width: "100%",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                padding: 12,
                borderRadius: 15,
              }}
            >
              <Dropdown
                style={[isFocusTipoConditions && { borderColor: "blue" }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={cat_016_condicion_de_la_operacion}
                itemTextStyle={{
                  fontSize: 16,
                }}
                search
                maxHeight={250}
                labelField="valores"
                valueField="id"
                placeholder={
                  !isFocusTipoConditions ? "Selecciona un item " : "..."
                }
                value={conditionPayment}
                searchPlaceholder="Escribe para buscar..."
                onFocus={() => setIsFocusTipoConditions(true)}
                onBlur={() => setIsFocusTipoConditions(false)}
                onChange={(item) => {
                  setConditions(item.id);
                  setConditionPayment(item);
                  setIsFocusTipoConditions(false);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color={isFocusTipoConditions ? "blue" : "black"}
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </SafeAreaView>
          </View>
          <View style={{ width: "100%", marginTop: 20 }}>
            <Text style={stylesGlobals.textInput}>
              Tipo de documento a emitir
            </Text>
            <SafeAreaView
              style={{
                width: "100%",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                padding: 12,
                borderRadius: 15,
              }}
            >
              <Dropdown
                style={[isFocusTipoDocum && { borderColor: "blue" }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={defaultDocument}
                itemTextStyle={{
                  fontSize: 16,
                }}
                search
                maxHeight={250}
                labelField="valores"
                valueField="id"
                placeholder={!isFocusTipoDocum ? "Selecciona un item " : "..."}
                searchPlaceholder="Escribe para buscar..."
                value={typeDocument}
                onFocus={() => setIsFocusTipoDocum(true)}
                onBlur={() => setIsFocusTipoDocum(false)}
                onChange={(item) => {
                  setTypeDocument(item);
                  setIsFocusTipoDocum(false);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color={isFocusTipoDocum ? "blue" : "black"}
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </SafeAreaView>
          </View>
          {/* {props.typeDocument && props.typeDocument.codigo === "14" && (
          <>
            <View
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: "90%",
                  marginTop: 17,
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontWeight: "500" }}>Observaciones</Text>
                <View style={styles.inputObservcation}>
                  <MaterialCommunityIcons
                    color={"#939393"}
                    name="card-text-outline"
                    size={28}
                    style={{
                      position: "absolute",
                      left: 7,
                      top: "50%",
                      transform: [{ translateY: -15 }],
                    }}
                  />
                  <Input
                    placeholder="Observaciones..."
                    onFocus={() => {
                      setFocusButton(true);
                    }}
                    handleBlur={() => {
                      setFocusButton(false);
                    }}
                    onChangeText={(text) => {
                      handlePagoChange(text);
                    }}
                    defaultValue={props.customer?.correo}
                    icon={"card-text-outline"}
                    keyboardType={"numeric"}
                  />
                </View>
              </View>
            </View>
          </>
        )} */}
          {/* <View style={{ marginTop: 20, flexDirection: "row" }}>
            <View style={{width: "5s0%"}}>
              <Input
                placeholder="00.00"
                //  onChangeText={handleChange("start")}
                keyboardType="numeric"
                //  values={String(values.start)}
                //  handleBlur={handleBlur("start")}
                icon="currency-usd"
              />
            </View>
            <Text>Vuelto:</Text>
          </View> */}
          <View style={{ ...stylesGlobals.viewBotton, marginTop: 10 }}>
            <Button
              withB={390}
              onPress={() => setDetails(true)}
              Title="Detalle de pago"
              color={theme.colors.third}
            />
          </View>
        </View>
      ) : (
        <>
          <View style={{ position: "absolute", top: -115, left: 15 }}>
            <MaterialCommunityIcons
              color={"white"}
              name="arrow-left-thin"
              size={35}
              onPress={() => setDetails(false)}
            />
          </View>
          <View
            style={{
              height: "100%",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {typeDocument && typeDocument.codigo === "03" && (
              <View style={{ width: "100%" }}>
                <Text style={stylesGlobals.textInput}>
                  Tipo de tributo a aplicar
                </Text>
                <SafeAreaView
                  style={{
                    width: "100%",
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    padding: 12,
                    borderRadius: 15,
                  }}
                >
                  <Dropdown
                    style={[isFocusTributo && { borderColor: "blue" }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={cat_015_tipos_tributo}
                    itemTextStyle={{
                      fontSize: 16,
                    }}
                    disable={true}
                    search
                    maxHeight={250}
                    labelField="valores"
                    valueField="id"
                    placeholder={
                      !isFocusTributo ? "Selecciona un item " : "..."
                    }
                    searchPlaceholder="Escribe para buscar..."
                    value={typeTribute}
                    onFocus={() => setIsFocusTributo(true)}
                    onBlur={() => setIsFocusTributo(false)}
                    onChange={(item) => {
                      props.setTypeTribute(item);
                      setIsFocusTributo(false);
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={isFocusTributo ? "blue" : "black"}
                        name="Safety"
                        size={20}
                      />
                    )}
                  />
                </SafeAreaView>
              </View>
            )}
            <ScrollView
              style={{
                width: "100%",
                marginTop: 20,
                marginBottom: 110,
              }}
            >
              <View style={{ ...stylesGlobals.viewScroll }}>
                {pays.map((item, index) => (
                  <Card
                    style={{ ...stylesGlobals.styleCard, width: "95%" }}
                    key={index}
                  >
                    <Pressable
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        zIndex: 50,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={30}
                        onPress={() => {
                          handleRemovePay(index);
                        }}
                      />
                    </Pressable>
                    <View style={{ width: 300, height: "auto" }}>
                      <View
                        style={{
                          width: "100%",
                          marginTop: 25,
                          flexDirection: "column",
                        }}
                      >
                        <View style={{ marginTop: 10, width: "100%" }}>
                          <Text style={stylesGlobals.textInput}>
                            Método de pago
                          </Text>
                          <SafeAreaView
                            style={{
                              width: "100%",
                              borderWidth: 1,
                              borderColor: "#D1D5DB",
                              padding: 12,
                              borderRadius: 15,
                            }}
                          >
                            <Dropdown
                              style={[isFocusPago && { borderColor: "blue" }]}
                              placeholderStyle={styles.placeholderStyle}
                              selectedTextStyle={styles.selectedTextStyle}
                              inputSearchStyle={styles.inputSearchStyle}
                              iconStyle={styles.iconStyle}
                              data={cat_017_forma_de_pago}
                              itemTextStyle={{
                                fontSize: 16,
                              }}
                              search
                              maxHeight={250}
                              labelField="valores"
                              valueField="id"
                              placeholder={
                                !isFocusPago ? "Selecciona un item " : "..."
                              }
                              value={typePayment}
                              searchPlaceholder="Escribe para buscar..."
                              onFocus={() => setIsFocusPago(true)}
                              onBlur={() => setIsFocusPago(false)}
                              onChange={(item) => {
                                handleUpdateTipoPago(index, item.codigo);
                                setTypePayment(item);
                                setIsFocusPago(false);
                              }}
                              renderLeftIcon={() => (
                                <AntDesign
                                  style={styles.icon}
                                  color={isFocusPago ? "blue" : "black"}
                                  name="Safety"
                                  size={20}
                                />
                              )}
                            />
                          </SafeAreaView>
                        </View>
                        <View
                          style={{
                            width: "100%",
                            marginTop: 15,
                          }}
                        >
                          <Text style={stylesGlobals.textInput}>Monto</Text>
                          <View style={{ marginBottom: 15 }}>
                            <Input
                              keyboardType="numeric"
                              placeholder="0.0"
                              onFocus={() => {
                                setFocusButton(true);
                              }}
                              handleBlur={() => {
                                setFocusButton(false);
                              }}
                              defaultValue={
                                typeDocument?.codigo === "01"
                                  ? amountsToPay[index].toFixed(2)
                                  : amountsToPayIva[index].toFixed(2)
                              }
                              onChangeText={(text) => {
                                onUpdateMonto(index, Number(text));
                                handlePagoChange(text);
                              }}
                              icon="currency-usd"
                              aria-labelledbyledBy="inputLabel"
                            />
                          </View>
                          {typeDocument?.codigo === "01" ? (
                            <Text
                              style={{
                                ...stylesGlobals.textInput,
                                fontWeight: "500",
                                fontSize: 15,
                              }}
                            >
                              Total: ${amountsToPay[index].toFixed(2)}
                            </Text>
                          ) : (
                            <View style={{ flexDirection: "row" }}>
                              <Text
                                style={{
                                  fontWeight: "500",
                                  marginTop: -15,
                                  fontSize: 16,
                                }}
                              >
                                subtotal: ${amountsToPay[index].toFixed(2)}
                              </Text>
                              <Text
                                style={{
                                  fontWeight: "500",
                                  marginTop: -15,
                                  fontSize: 16,
                                  marginLeft: 89,
                                }}
                              >
                                Total: ${amountsToPayIva[index].toFixed(2)}
                              </Text>
                            </View>
                          )}
                          {/* <Text>{`Vuelto: ${formatCurrency(vuelto)}`}</Text> */}
                        </View>
                        {conditions > 1 && (
                          <>
                            <View style={{ marginTop: 10, width: "100%" }}>
                              <Text style={stylesGlobals.textInput}>
                                Plazo de pago
                              </Text>
                              <SafeAreaView
                                style={{
                                  width: "100%",
                                  borderWidth: 1,
                                  borderColor: "#D1D5DB",
                                  padding: 12,
                                  borderRadius: 15,
                                }}
                              >
                                <Dropdown
                                  style={[
                                    isFocusPago && { borderColor: "blue" },
                                  ]}
                                  placeholderStyle={styles.placeholderStyle}
                                  selectedTextStyle={styles.selectedTextStyle}
                                  inputSearchStyle={styles.inputSearchStyle}
                                  iconStyle={styles.iconStyle}
                                  data={cat_018_plazo}
                                  itemTextStyle={{
                                    fontSize: 16,
                                  }}
                                  search
                                  maxHeight={250}
                                  labelField="valores"
                                  valueField="id"
                                  placeholder={
                                    !isFocusPago ? "Selecciona un item " : "..."
                                  }
                                  searchPlaceholder="Escribe para buscar..."
                                  onFocus={() => setIsFocusPago(true)}
                                  onBlur={() => setIsFocusPago(false)}
                                  onChange={(item) => {
                                    handleUpdatePlazo(index, item.codigo);
                                    setIsFocusPago(false);
                                  }}
                                  renderLeftIcon={() => (
                                    <AntDesign
                                      style={styles.icon}
                                      color={isFocusPago ? "blue" : "black"}
                                      name="Safety"
                                      size={20}
                                    />
                                  )}
                                />
                              </SafeAreaView>
                            </View>
                            <View
                              style={{
                                width: "100%",
                                marginTop: 25,
                                flexDirection: "column",
                              }}
                            >
                              <Text style={{ fontWeight: "500" }}>Periodo</Text>
                              <Input
                                keyboardType="numeric"
                                placeholder="Digita los días..."
                                onFocus={() => {
                                  setFocusButton(true);
                                }}
                                handleBlur={() => {
                                  setFocusButton(false);
                                }}
                                onChangeText={(text) => {
                                  onUpdatePeriodo(index, Number(text));
                                }}
                                icon="calendar-range"
                                aria-labelledbyledBy="inputLabel"
                              />
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                    {stateMonts === false && (
                      <View
                        style={{
                          flexDirection: "row",
                          marginTop: 20,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Pressable
                          onPress={() => {
                            handleAddPay();
                            handleMounts();
                          }}
                          style={{
                            flexDirection: "row",
                            marginTop: 5,
                            width: 40,
                            height: 40,
                            backgroundColor: "#023",
                            borderRadius: 10,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <MaterialCommunityIcons
                            color={"#ffffff"}
                            name="plus"
                            size={25}
                          />
                        </Pressable>
                      </View>
                    )}
                  </Card>
                ))}
              </View>
            </ScrollView>
          </View>
        </>
      )}
    </>
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
  input: {
    height: 45,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 5,
  },
  inputObservcation: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginTop: 10,
  },
});
