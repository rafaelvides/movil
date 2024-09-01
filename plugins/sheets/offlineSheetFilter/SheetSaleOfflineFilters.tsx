import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
// import {
//   type_document,
//   type_document_filter,
// } from "@/offline/global/document_to_be_issued";
import { Dropdown } from "react-native-element-dropdown";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
// import { Input } from "@/~/components/ui/input";
import { DatePickerModal } from "react-native-paper-dates";
import { returnDate } from "@/utils/date";

const SheetSaleOfflineFilters = ({
  sheetId,
  payload,
}: SheetProps<"sale-offline-filters-sheet">) => {
  const [isFocusTipoDocum, setIsFocusTipoDocum] = useState(false);
  const [typeDoc, setTypeDocument] = useState<ICat002TipoDeDocumento>(
    payload!.typeDTE
  );
  const [showCalendarStart, setShowCalendarStart] = useState(false);

  const [startDate, setStartDate] = useState(
    payload?.startDate
      ? new Date(
          new Date(payload.startDate).getTime() +
            new Date().getTimezoneOffset() * 60000
        )
      : new Date()
  );
  return (
    <>
      <ActionSheet
        id={sheetId}
        statusBarTranslucent={true}
        drawUnderStatusBar={false}
        gestureEnabled={true}
        containerStyle={{ paddingHorizontal: 12, height: "auto" }}
        springOffset={50}
        defaultOverlayOpacity={0.4}
      >
        <View style={{ marginBottom: "10%" }}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 20 }}>Filtros disponibles</Text>
          </View>
          <View
            style={{
              marginTop: 15,
              width: "100%",
            }}
          >
            <View style={{ width: "100%", marginTop: 20 }}>
              <Text style={{ fontWeight: "500", marginLeft: "3%" }}>
                Tipo documento
              </Text>
             
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
            <Text style={{ marginLeft: "3%", fontWeight: "500" }}>Total</Text>
            <View style={styles.inputWrapper}>
           
            </View>
          </View>
          <Pressable
            onPress={() =>
              payload?.handleConfirm(returnDate(startDate), typeDoc)
            }
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 4,
              backgroundColor: "#1F91DC",
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

export default SheetSaleOfflineFilters;

const styles = StyleSheet.create({
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
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
