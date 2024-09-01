import { useExpenseStore } from "@/store/expense.store";
import { AntDesign } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

const SheetExpenseFilters = ({
  sheetId,
  payload,
}: SheetProps<"expense-filters-sheet">) => {
  const [limit, setLimit] = useState(payload?.limit || 0);
  const [category, setCategory] = useState(payload?.category || "");
  const [isFocus, setIsFocus] = useState(false);
  const { getCategoryExpenses, categoryExpenses } = useExpenseStore();

  const limitDate = [
    { key: "5" },
    { key: "10" },
    { key: "20" },
    { key: "30" },
    { key: "40" },
    { key: "50" },
    { key: "100" },
  ];

  //--------useEffect------
  useEffect(() => {
    getCategoryExpenses();
  }, []);

  const handleLimit = (item: any) => {
    setLimit(item.key);
  };

  const handleCategory = (item: any) => {
    setCategory(item.name);
  };

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
        <View
          style={{
            marginBottom: "10%",
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 20 }}>Filtros disponibles</Text>
          </View>

          <View
            style={{
              marginTop: 15,
              width: "100%",
            }}
          >
            <Text style={{ marginLeft: "3%", fontWeight: "500" }}>
              Categoría de gastos
            </Text>
            <SafeAreaView
              style={{
                width: "100%",
                marginTop: 10,
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
                data={categoryExpenses}
                itemTextStyle={{
                  fontSize: 16,
                }}
                search
                maxHeight={250}
                labelField="name"
                valueField="name"
                searchPlaceholder="Escribe para buscar..."

                placeholder={!isFocus ? "Selecciona un item " : "..."}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(item) => {
                  handleCategory(item);
                  setIsFocus(false);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.iconExpense}
                    color={"green"}
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </SafeAreaView>

            <Text style={{ marginLeft: "3%", fontWeight: "500" }}>
              Cantidad
            </Text>
            <View style={styles.inputWrapper}>
              <Dropdown
                style={{
                  height: 50,
                  borderColor: "#D9D9DA",
                  borderWidth: 1,
                  borderRadius: 15,
                }}
                placeholderStyle={{
                  color: "#D9D9DA",
                }}
                selectedTextStyle={{
                  color: "#1F91DC",
                  left: 10,
                }}
                value={String(limit)}
                data={limitDate}
                labelField="key"
                valueField="key"
                placeholder={
                  limit === 0
                    ? "Cant. de registros"
                    : `Cant. de registros ${limit}`
                }
                onChange={handleLimit}
              />
            </View>
          </View>
          <Pressable
            onPress={() => payload?.handleConfirm(limit, category)}
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
    </>
  );
};

export default SheetExpenseFilters;

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
  iconExpense: {
    marginRight: 5,
  },
});
