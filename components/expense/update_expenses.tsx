import { ThemeContext } from "@/hooks/useTheme";
import { get_box_data } from "@/plugins/async_storage";
import { useExpenseStore } from "@/store/expense.store";
import {
  IExpensePayload,
  IUpdateExpense,
} from "@/types/expenses/expense.types";
import { AntDesign } from "@expo/vector-icons";
import { Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import {
  Text,
  SafeAreaView,
  ToastAndroid,
  View,
  StyleSheet,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { ScrollView } from "react-native-gesture-handler";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as yup from "yup";

interface Props {
  closeModal: () => void;
  expenses?: IExpensePayload;
  id?: number;
}

export const UpdateExpenses = (props: Props) => {
  const [isFocus, setIsFocus] = useState(false);
  const { update_expenses, getCategoryExpenses, categoryExpenses } =
    useExpenseStore();
  const [boxId, setBoxId] = useState(0);
  const { theme } = useContext(ThemeContext);
  const [category, setCategory] = useState("");

  useEffect(() => {
    get_box_data().then((data) => {
      if (data) {
        setBoxId(data.id);
      }
    });
    getCategoryExpenses();
    selectedCategory();
  }, [category, props.expenses]);

  const validationSchema = yup.object().shape({
    description: yup.string().required("*La descripción es requerida"),
    total: yup
      .number()
      .required("*El total es requerido")
      .min(0.01, "*El total debe ser mayor a 0.01")
      .positive("*El total debe ser mayor a 0"),
  });

  const onSubmit = async (payload: IUpdateExpense) => {
    try {
      await update_expenses(payload, props.id!);
      props.closeModal();
    } catch (error) {
      ToastAndroid.show("Error al editar este registro", ToastAndroid.LONG);
      props.closeModal();
    }
  };

  const selectedCategory = () => {
    if (props.expenses?.categoryExpenseId) {
      categoryExpenses.map((data) => {
        if (data.id === props.expenses?.categoryExpenseId) {
          setCategory(data.name);
        }
      });
    }
  };

  return (
    <>
      <Formik
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        initialValues={{
          description: props.expenses?.description ?? "",
          total: props.expenses?.total ?? 0,
          categoryExpenseId: props.expenses?.categoryExpenseId ?? 0,
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            <MaterialCommunityIcons
              name="close"
              onPress={() => props.closeModal()}
              size={20}
              style={{ left: 130 }}
            />
            <ScrollView>
              <View
                style={{
                  width: 300,
                  height: "100%",
                }}
              >
                <SafeAreaView>
                  <View style={{}}>
                    <Text style={styles.label}>
                      Descripción: <Text style={styles.required}>*</Text>
                    </Text>
                   
                    {errors.description && touched.description && (
                      <Text style={styles.errorText}>{errors.description}</Text>
                    )}

                    <Text style={styles.label}>
                      Total: <Text style={styles.required}>*</Text>
                    </Text>
                   
                    {errors.total && touched.total && (
                      <Text style={styles.errorText}>{errors.total}</Text>
                    )}

                    <Text style={styles.label}>
                      Categoría: <Text style={styles.required}>*</Text>
                    </Text>
                    <View
                      style={{
                        marginTop: 6,
                        height: 50,
                        borderColor: "#D9D9DA",
                        borderWidth: 1,
                        borderRadius: 15,
                        width: "98%",
                      }}
                    >
                      <Dropdown
                        style={[
                          isFocus && {
                            borderColor: "blue",
                            borderRadius: 15,
                          },
                        ]}
                        placeholderStyle={{
                          fontSize: 16,
                          marginTop: 10,
                          marginLeft: 6,
                        }}
                        selectedTextStyle={{
                          fontSize: 16,
                          marginTop: 10,
                        }}
                        iconStyle={{
                          width: 20,
                          height: 20,
                          top: 6,
                          marginRight: 10,
                        }}
                        data={categoryExpenses}
                        itemTextStyle={{
                          fontSize: 16,
                        }}
                        search
                        maxHeight={250}
                        labelField="name"
                        valueField="id"
                        placeholder={
                          props.expenses?.categoryExpenseId
                            ? `${category}`
                            : "..." && !isFocus
                            ? "Selecciona una categoría"
                            : "..."
                        }
                        searchPlaceholder="Buscar categoría..."
                        value={
                          props.expenses?.categoryExpenseId.toString() &&
                          category
                        }
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={(item) => {
                          handleChange("categoryExpenseId")(item.id.toString());
                        }}
                        renderLeftIcon={() => (
                          <AntDesign
                            style={{
                              marginLeft: 10,
                              marginTop: 10,
                            }}
                            color={isFocus ? "blue" : "black"}
                            name="Safety"
                            size={20}
                          />
                        )}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  ></View>
                </SafeAreaView>
                <View
                  style={{
                    height: "60%",
                    marginTop: 40,
                    width: "100%",
                  }}
                >
                
                </View>
              </View>
            </ScrollView>
          </>
        )}
      </Formik>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  safeAreaView: {
    // flex: 1,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  required: {
    color: "#EF4444",
  },
  input: {
    height: 50,
    borderColor: "#D9D9DA",
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: "98%",
  },
  dropdown: {
    marginBottom: 10,
  },
  selectFilesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ccc",
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    // marginRight: 10,
    fontSize: 16,
    // fontWeight: "bold",
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  fileName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: "red",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "white",
  },
  submitButton: {
    backgroundColor: "#007BFF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 5,
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 5,
  },
});
