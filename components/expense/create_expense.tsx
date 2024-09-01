import { useExpenseStore } from "@/store/expense.store";
import { useContext, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ToastAndroid,
  Image,
  ScrollView,
} from "react-native";
import { ThemeContext } from "@/hooks/useTheme";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as yup from "yup";
import { get_box_data } from "@/plugins/async_storage";
import { ICreateExpense } from "@/types/expenses/expense.types";
import { Dropdown } from "react-native-element-dropdown";
import React from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface Props {
  closeModal: () => void;
}


const CreateExpense = (props: Props) => {
  const [idBox, setIdBox] = useState<number>(0)
  const [isFocus, setIsFocus] = useState(false);
  const { getCategoryExpenses, post_expense, categoryExpenses } =
    useExpenseStore();
  const { theme } = useContext(ThemeContext);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);


  useEffect(() => {
    get_box_data().then((data) => {
      if (data) {
        setIdBox(data.id);
      }
    });
  }, []);

  useEffect(() => {
    getCategoryExpenses();
  }, []);


  const validationSchema = yup.object().shape({
    description: yup.string().required("*La descripción es requerida"),
    total: yup
      .number()
      .required("*El total es requerido")
      .min(0.01, "*El total debe ser mayor a 0.01")
      .positive("*El total debe ser mayor a 0"),
      // categoryExpenseId: yup.number().required("**La categoría es requerida**")
      categoryExpenseId: yup.number().required().test("test", "La categoría es requerida",()=>{
        if(selectedCategoryId > 0){
          return true
        }else{
          return false
        }
      })
  });

  const onSubmit = async (payload: ICreateExpense) => {
    try {
      await post_expense({
        ...payload,
        boxId: idBox,
        categoryExpenseId: Number(selectedCategoryId),
      });
      ToastAndroid.show("Gasto creado correctamente", ToastAndroid.SHORT);

      props.closeModal();
    } catch (error) {
      ToastAndroid.show("Error al crear el gasto", ToastAndroid.LONG);
    }
  }

  return (
    <Formik
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      initialValues={{
        description: "",
        total: 0,
        boxId: idBox,
        categoryExpenseId: Number(selectedCategoryId),
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
                        marginLeft:10
                      }}
                      selectedTextStyle={{
                        fontSize: 16,
                        marginTop: 10,
                      }}
                      iconStyle={{
                        width: 20,
                        height: 20,
                        top:6,
                        marginRight:10,
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
                        !isFocus ? "Selecciona una categoría" : "..."
                      }
                      searchPlaceholder="Buscar categoría..."
                      value={values.categoryExpenseId.toString()}
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={(item) => setSelectedCategoryId(item.id)}
                      renderLeftIcon={() => (
                        <AntDesign
                          style={{
                            marginLeft:10,
                            marginTop: 10,
                          }}
                          color={isFocus ? "blue" : "black"}
                          name="Safety"
                          size={20}
                        />
                      )}
                    />
                     {errors.categoryExpenseId && touched.categoryExpenseId && (
                    <Text style={{...styles.errorText, marginTop: 12}}>{errors.categoryExpenseId}</Text>
                  )}
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
                  width:"100%"
                }}
              >
               
              </View>
            </View>
          </ScrollView>
        </>
      )}
    </Formik>
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
    marginRight: 10,
    fontSize: 16,
    fontWeight: "bold",
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

export default CreateExpense;
