import { StyleSheet, Pressable, SafeAreaView, Text, View } from "react-native";
import React, { useState } from "react";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { Dropdown } from "react-native-element-dropdown";
import { typeMap } from "@/utils/type_maps";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { MapType } from "react-native-maps";
import { useCustomerStore } from "@/store/customer.store";
import { ICustomer } from "@/types/customer/customer.types";
import { IBranch } from "@/types/branch/branch.types";
import { useBranchStore } from "@/store/branch.store";
// import { Input } from "@/~/components/ui/input";
import { DatePickerModal } from "react-native-paper-dates";
import { returnDate } from "@/utils/date";

const SheetRouteBranchClientFilters = ({
  sheetId,
  payload,
}: SheetProps<"routes-branch-client-filters-sheet">) => {
  const [isFocus, setIsFocus] = useState(false);
  const [isFocusClient, setIsFocusClient] = useState(false);
  const [isFocusBran, setIsFocusBran] = useState(false);
  const [showCalendarStart, setShowCalendarStart] = useState(false);
  const [selectedOptionMap, setSelectedOptionMap] = useState<MapType>(
    payload?.selectedOptionMap!
  );
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer>(
    payload?.selectedCustomer!
  );
  const [startDate, setStartDate] = useState(
    payload?.startDate
      ? new Date(
          new Date(payload.startDate).getTime() +
            new Date().getTimezoneOffset() * 60000
        )
      : new Date()
  );
  const [selectedBranch, setSelectedBranch] = useState<IBranch>(
    payload?.selectedBranch!
  );
  const { branches } = useBranchStore();
  const { customer_list } = useCustomerStore();
  const handleMapTypeChange = (newMapType: MapType) => {
    setSelectedOptionMap(newMapType);
    payload?.setSelectedOptionMap(newMapType);
  };
  return (
    <>
      <ActionSheet
        id={sheetId}
        statusBarTranslucent={true}
        drawUnderStatusBar={false}
        gestureEnabled={true}
        containerStyle={{
          paddingHorizontal: 12,
          height: "auto",
        }}
        springOffset={50}
        defaultOverlayOpacity={0.4}
      >
        <View style={{ marginBottom: "10%" }}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 20 }}>Filtros de ubicación</Text>
          </View>
          <View style={{ width: "100%", marginTop: 10 }}>
            <Text style={{ fontWeight: "500", marginTop: 10 }}>
              Tipo de mapa
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
                containerStyle={{
                  top: "43%",
                }}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={typeMap}
                itemTextStyle={{
                  fontSize: 16,
                }}
                search
                maxHeight={250}
                labelField="name"
                valueField="name"
                placeholder={!isFocus ? "Selecciona un item " : "..."}
                searchPlaceholder="Escribe para buscar..."
                value={selectedOptionMap}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(item) => {
                  handleMapTypeChange(item.name);
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
          <View style={{ width: "100%", marginTop: 10 }}>
            <Text style={{ fontWeight: "500", marginTop: 10 }}>
              Sucursal en ruta
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
                style={[isFocusBran && { borderColor: "blue" }]}
                containerStyle={{
                  bottom: "12%",
                }}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={branches}
                itemTextStyle={{
                  fontSize: 16,
                }}
                search
                maxHeight={250}
                labelField="name"
                valueField="id"
                placeholder={!isFocusBran ? "Selecciona un item " : "..."}
                searchPlaceholder="Escribe para buscar..."
                value={selectedBranch}
                onFocus={() => setIsFocusBran(true)}
                onBlur={() => setIsFocusBran(false)}
                onChange={(item) => {
                  setSelectedBranch(item);
                  setIsFocusBran(false);
                }}
                renderLeftIcon={() =>
                  selectedBranch ? (
                    selectedBranch.location ? (
                      <AntDesign
                        style={styles.icon}
                        color={"green"}
                        name="checkcircle"
                        size={20}
                      />
                    ) : (
                      <AntDesign
                        style={styles.icon}
                        color={"red"}
                        name="closecircle"
                        size={20}
                      />
                    )
                  ) : (
                    <AntDesign
                      style={styles.icon}
                      color={isFocusBran ? "blue" : "black"}
                      name="Safety"
                      size={20}
                    />
                  )
                }
              />
            </SafeAreaView>
          </View>
          <View style={{ width: "100%", marginTop: 10 }}>
            <Text style={{ fontWeight: "500", marginTop: 10 }}>
              Cliente destino
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
                style={[isFocusClient && { borderColor: "blue" }]}
                containerStyle={{
                  bottom: "15%",
                }}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={customer_list}
                itemTextStyle={{
                  fontSize: 16,
                }}
                search
                maxHeight={250}
                labelField="nombre"
                valueField="id"
                placeholder={!isFocusClient ? "Selecciona un item " : "..."}
                searchPlaceholder="Escribe para buscar..."
                value={selectedCustomer}
                onFocus={() => setIsFocusClient(true)}
                onBlur={() => setIsFocusClient(false)}
                onChange={(item) => {
                  setSelectedCustomer(item);
                  setIsFocusClient(false);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color={isFocusClient ? "blue" : "black"}
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </SafeAreaView>
          </View>
          <View style={{ marginTop: 15, width: "100%" }}>
            <Text style={{ marginLeft: "3%", fontWeight: "500" }}>
              Fechas de la ubicación
            </Text>
            <View style={styles.inputWrapper}>
             
              <MaterialCommunityIcons
                color={"#1359"}
                name="calendar-multiple"
                size={27}
                style={styles.iconInput}
                onPress={() => setShowCalendarStart(true)}
              />
            </View>
          </View>
          <Pressable
            onPress={() =>
              payload?.handleConfirm(
                selectedOptionMap,
                selectedCustomer,
                selectedBranch,
                returnDate(startDate)
              )
            }
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 4,
              backgroundColor: "#1d4ed8",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              Filtrar
            </Text>
          </Pressable>
        </View>
      </ActionSheet>
      <DatePickerModal
        locale="es"
        mode="single"
        date={new Date(startDate)}
        visible={showCalendarStart}
        onConfirm={({ date }) => {
          if (date) {
            setStartDate(date);
          }
          setShowCalendarStart(false);
        }}
        onDismiss={() => {
          setShowCalendarStart(false);
        }}
      />
    </>
  );
};

export default SheetRouteBranchClientFilters;

const styles = StyleSheet.create({
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
  icon: {
    marginRight: 5,
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  input: {
    height: "100%",
    paddingLeft: 15,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
    fontSize: 16,
  },
  iconInput: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -15 }],
  },
});
