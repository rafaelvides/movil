import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { DatePickerModal } from "react-native-paper-dates";
import { returnDate } from "@/utils/date";

const SheetSalesFilters = ({
  sheetId,
  payload,
}: SheetProps<"sales-filters-sheet">) => {
  const [startDate, setStartDate] = useState(
    payload?.startDate
      ? new Date(
          new Date(payload.startDate).getTime() +
            new Date().getTimezoneOffset() * 60000
        )
      : new Date()
  );
  const [endDate, setEndDate] = useState(
    payload?.startDate
      ? new Date(
          new Date(payload.startDate).getTime() +
            new Date().getTimezoneOffset() * 60000
        )
      : new Date()
  );
  const [showCalendarStart, setShowCalendarStart] = useState(false);

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
            <Text style={{ fontSize: 20 }}>Filtros disponibles</Text>
          </View>
          <View style={{ marginTop: 15, width: "100%" }}>
            <Text style={{ marginLeft: "3%", fontWeight: "500" }}>
              Fechas de las ventas
            </Text>
            <View style={styles.inputWrapper}>
            
              <MaterialCommunityIcons
                color={"#1359"}
                name="calendar-multiple"
                size={27}
                style={styles.icon}
                onPress={() => setShowCalendarStart(true)}
              />
            </View>
          </View>
          <Pressable
            onPress={() =>
              payload?.handleConfirm(returnDate(startDate), returnDate(endDate))
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
        mode="range"
        visible={showCalendarStart}
        onConfirm={({ startDate, endDate }) => {
          if (startDate) {
            setStartDate(startDate);
          }
          if (endDate) {
            setEndDate(endDate);
          }
          setShowCalendarStart(false);
        }}
        startDate={new Date(startDate)}
        endDate={new Date(endDate)}
        onDismiss={() => {
          setShowCalendarStart(false);
        }}
      />
    </>
  );
};

export default SheetSalesFilters;

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    width: "100%",
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  icon: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -15 }],
  },
  input: {
    height: "100%",
    paddingLeft: 15,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
    fontSize: 16,
  },
});
