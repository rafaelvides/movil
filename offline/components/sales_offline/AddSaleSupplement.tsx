import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useState,
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
//   import { Card, CardContent } from "@/~/components/ui/card";
  import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
//   import { Input } from "@/~/components/ui/input";
  import { IFormasDePagoResponse } from "@/types/billing/cat-017-forma-de-pago.types";
  import { useBranchProductOfflineStore } from "@/offline/store/branch_product_offline.store";
  import { useClientOfflineStore } from "@/offline/store/customer_offline.store";
  import { condition_operation } from "@/offline/global/dte/condition_of_operation";
  import { deadline } from "@/offline/global/dte/deadline";
  import { type_document } from "@/offline/global/dte/document_to_be_issued";
  import { method_of_payment } from "@/offline/global/dte/method_of_payment";
  import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
  import { Customer } from "../../entity/customer.entity";
  import { type_of_tax } from "@/offline/global/dte/type_of_tax";
  import { ITipoTributo } from "@/types/billing/cat-015-tipo-de-tributo.types";
  import { ICondicionDeLaOperacion } from "@/types/billing/cat-016-condicion-de-la-operacion.types";
  
  interface Props {
    customer: Customer | undefined;
    pays: IFormasDePagoResponse[];
    totalUnformatted: number;
    typeDocument: ICat002TipoDeDocumento | undefined;
    typeTribute: ITipoTributo | undefined;
    conditionPayment: ICondicionDeLaOperacion;
  
    setCustomer: Dispatch<SetStateAction<Customer | undefined>>;
    setTypeDocument: Dispatch<SetStateAction<ICat002TipoDeDocumento>>;
    setFocusButton: Dispatch<SetStateAction<boolean>>;
    handleAddPay: () => void;
    onUpdatePeriodo: (index: number, value: number) => void;
    onUpdateMonto: (index: number, value: number) => void;
    handleUpdatePlazo: (index: number, value: string) => void;
    handleUpdateTipoPago: (index: number, value: string) => void;
    setConditionPayment: Dispatch<SetStateAction<ICondicionDeLaOperacion>>;
    handleRemovePay: (index: number) => void;
    setTypeTribute: Dispatch<SetStateAction<ITipoTributo>>;
  }
  const AddSalesSupplement = (props: Props) => {
    const {
      pays,
      totalUnformatted,
      typeDocument,
      setFocusButton,
      customer,
      setCustomer,
      setTypeTribute,
      typeTribute,
      conditionPayment,
      setConditionPayment,
      handleRemovePay,
      handleUpdateTipoPago,
      onUpdateMonto,
      handleUpdatePlazo,
      onUpdatePeriodo,
      handleAddPay,
    } = props;
    const [isFocus, setIsFocus] = useState(false);
    const [isFocusPago, setIsFocusPago] = useState(false);
    const [isFocusTipoDocum, setIsFocusTipoDocum] = useState(false);
    const [isFocusTipoConditions, setIsFocusTipoConditions] = useState(false);
    const [conditions, setConditions] = useState(0);
    const [stateMonts, setStateMonts] = useState(false);
    const { totalIva } = useBranchProductOfflineStore();
    const [vuelto, setVuelto] = useState(0);
    const { OnGetClientsList, clientList } = useClientOfflineStore();
    const [isFocusTributo, setIsFocusTributo] = useState(false);
    const [typePayment, setTypePayment] = useState({
      codigo: "01",
      id: 1,
      isActivated: true,
      valores: "Billetes y monedas",
    });
  
    useEffect(() => {
      OnGetClientsList();
    }, []);
    const handlePagoChange = (pagoValue: string) => {
      const pagoNumber = Number(pagoValue);
      const vuelto = pagoNumber - Number(totalUnformatted);
      setVuelto(vuelto);
    };
    //----total for each card------
    const numCards = pays.length;
  
    let baseAmount = totalUnformatted / numCards;
    let baseAmountIva = totalIva / numCards;
  
    let amountsToPay = pays.map((_, index) => {
      return parseFloat(baseAmount.toFixed(2));
    });
    let amountsToPayIva = pays.map((_, index) => {
      return parseFloat(baseAmountIva.toFixed(2));
    });
  
    let sumSoFar = amountsToPay.reduce((acc, amount) => acc + amount, 0);
    let sumSoFarIva = amountsToPayIva.reduce((acc, amount) => acc + amount, 0);
  
    let difference = totalUnformatted - sumSoFar;
    let differenceIva = totalIva - sumSoFarIva;
  
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
    const defaultCustomerKey = useMemo(() => {
      if (!customer) {
        setCustomer(clientList.length > 0 ? clientList[0] : undefined);
        return clientList.length > 0 ? clientList[0] : undefined;
      }
    }, [clientList]);
    return (
      <>
        <StatusBar style="light" />
        <View style={{ width: "100%", marginTop: 10 }}>
          <Text style={{ fontWeight: "500", marginTop: 10 }}>
            Cliente a facturar
          </Text>
          <SafeAreaView
            style={{
              width: "100%",
              marginTop: 10,
              borderWidth: 1,
              borderColor: "#D1D5DB",
              padding: 12,
              borderRadius: 5,
            }}
          >
            <Dropdown
              style={[isFocus && { borderColor: "blue" }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={clientList}
              itemTextStyle={{
                fontSize: 16,
              }}
              search
              maxHeight={250}
              labelField="nombre"
              valueField="id"
              placeholder={!isFocus ? "Selecciona un item " : "..."}
              searchPlaceholder="Escribe para buscar..."
              value={defaultCustomerKey}
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
          <Text style={{ fontWeight: "500" }}>Condición de la operación</Text>
          <SafeAreaView
            style={{
              width: "100%",
              marginTop: 10,
              borderWidth: 1,
              borderColor: "#D1D5DB",
              padding: 12,
              borderRadius: 5,
            }}
          >
            <Dropdown
              style={[isFocusTipoConditions && { borderColor: "blue" }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={condition_operation}
              itemTextStyle={{
                fontSize: 16,
              }}
              search
              maxHeight={250}
              labelField="valores"
              valueField="id"
              placeholder={!isFocusTipoConditions ? "Selecciona un item " : "..."}
              searchPlaceholder="Escribe para buscar..."
              value={conditionPayment}
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
          <Text style={{ fontWeight: "500" }}>Tipo de documento a emitir</Text>
          <SafeAreaView
            style={{
              width: "100%",
              marginTop: 10,
              borderWidth: 1,
              borderColor: "#D1D5DB",
              padding: 12,
              borderRadius: 5,
            }}
          >
            <Dropdown
              style={[isFocusTipoDocum && { borderColor: "blue" }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={type_document}
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
                props.setTypeDocument(item);
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
        <Text style={{ fontSize: 20, marginTop: 5 }}>Proceso de pago</Text>
        <View
          style={{
            height: "45%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ScrollView
            style={{
              width: "100%",
              marginBottom: -30,
            }}
          >
            {typeDocument && typeDocument.codigo === "03" && (
              <View
                style={{
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View style={{ width: "90%", marginTop: 17, marginBottom: 20 }}>
                  <Text style={{ fontWeight: "500" }}>
                    Tipo de tributo a aplicar
                  </Text>
                  <SafeAreaView
                    style={{
                      width: "100%",
                      marginTop: 10,
                      borderWidth: 1,
                      borderColor: "#D1D5DB",
                      padding: 12,
                      borderRadius: 5,
                    }}
                  >
                    <Dropdown
                      style={[isFocusTributo && { borderColor: "blue" }]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={type_of_tax}
                      itemTextStyle={{
                        fontSize: 16,
                      }}
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
                        setTypeTribute(item);
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
              </View>
            )}
            {pays.map((item, index) => (
              <View
                style={styles.card}
                key={index}
              >
                <Pressable
                  style={{
                    position: "absolute",
                    right: 15,
                    top: 10,
                    marginBottom: 40,
                    zIndex: 50,
                  }}
                >
                  <MaterialCommunityIcons
                    color={"#2C3377"}
                    name="close"
                    size={30}
                    onPress={() => {
                      handleRemovePay(index);
                    }}
                  />
                </Pressable>
                <View>
                  <View style={{ width: 300, height: "auto" }}>
                    <View
                      style={{
                        width: "100%",
                        marginTop: 25,
                        flexDirection: "column",
                      }}
                    >
                      <View style={{ marginTop: 10, width: "100%" }}>
                        <Text style={{ fontWeight: "500" }}>Método de pago</Text>
                        <SafeAreaView
                          style={{
                            width: "100%",
                            marginTop: 10,
                            borderWidth: 1,
                            borderColor: "#D1D5DB",
                            padding: 12,
                            borderRadius: 5,
                          }}
                        >
                          <Dropdown
                            style={[isFocusPago && { borderColor: "blue" }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            iconStyle={styles.iconStyle}
                            data={method_of_payment}
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
                            value={typePayment}
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
                        <Text style={{ fontWeight: "500" }}>Monto</Text>
                        <View style={styles.inputWrapper}>
                          <MaterialCommunityIcons
                            color={"#939393"}
                            name="currency-usd"
                            size={28}
                            style={{
                              position: "absolute",
                              left: 7,
                              top: "50%",
                              transform: [{ translateY: -15 }],
                            }}
                          />
                          {/* <Input
                            className="rounded-3xl"
                            style={{
                              height: 45,
                              paddingLeft: 40,
                              borderColor: "#D9D9DA",
                              borderWidth: 1,
                              borderRadius: 5,
                            }}
                            keyboardType="numeric"
                            placeholder="0.0"
                            onFocus={() => {
                              setFocusButton(true);
                            }}
                            onBlur={() => {
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
                            aria-labelledbyledBy="inputLabel"
                          /> */}
                        </View>
                        {typeDocument?.codigo === "01" ? (
                          <Text
                            style={{
                              fontWeight: "500",
                              marginTop: -15,
                              fontSize: 16,
                            }}
                          >
                            Total a pagar: ${amountsToPay[index].toFixed(2)}
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
                              subtotal: ${amountsToPayIva[index].toFixed(2)}
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
                            <Text style={{ fontWeight: "500" }}>
                              Plazo de pago
                            </Text>
                            <SafeAreaView
                              style={{
                                width: "100%",
                                marginTop: 10,
                                borderWidth: 1,
                                borderColor: "#D1D5DB",
                                padding: 12,
                                borderRadius: 5,
                              }}
                            >
                              <Dropdown
                                style={[isFocusPago && { borderColor: "blue" }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                data={deadline}
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
                            {/* <Input
                              className="rounded-3xl"
                              style={styles.input}
                              keyboardType="numeric"
                              placeholder="Digita los días..."
                              onFocus={() => {
                                setFocusButton(true);
                              }}
                              onBlur={() => {
                                setFocusButton(false);
                              }}
                              onChangeText={(text) => {
                                onUpdatePeriodo(index, Number(text));
                              }}
                              aria-labelledbyledBy="inputLabel"
                            /> */}
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                </View>
                {stateMonts === false && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 20,
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
              </View>
            ))}
          </ScrollView>
        </View>
      </>
    );
  };
  
  export default AddSalesSupplement;
  
  const styles = StyleSheet.create({
    placeholderStyle: {
      fontSize: 16,
    },
    icon: {
      marginRight: 5,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    selectedTextStyle: {
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
  });
  