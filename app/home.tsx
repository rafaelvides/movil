import AddBox from "@/components/box/AddBox";
import OptionsCloseBox from "@/components/box/OptionsCloseBox";
import Button from "@/components/Global/components_app/Button";
import { ThemeContext } from "@/hooks/useTheme";
import { get_point_sale_Id } from "@/plugins/async_storage";
import { return_token } from "@/plugins/secure_store";
import { verify_box } from "@/services/box.service";
import { get_theme_by_transmitter } from "@/services/personalization.service";
import { IBox } from "@/types/box/box.types";
import { useFocusEffect } from "expo-router";
import React from "react";
import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  RefreshControl,
  ToastAndroid,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

function home() {
  const [refreshing, setRefreshing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showModalClose, setIsShowModalClose] = useState(false);
  const [box, setBox] = useState<IBox>();

  const { toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const GetThemeConfiguration = async () => {
      try {
        const { data } = await get_theme_by_transmitter();
        if (data.ok) {
          const theme = {
            name: data.personalization.name,
            context: data.personalization.context,
            colors: data.personalization.colors,
          };
          toggleTheme({
            ...theme,
            colors: theme.colors,
            name: theme.name,
            context: theme.context === "light" ? "dark" : "light",
          });
        } else {
          throw new Error("No tienes tema seleccionado");
        }
      } catch (e) {}
    };
    GetThemeConfiguration();
  }, []);

  useEffect(() => {
    const handleVerifyBox = async () => {
      try {
        get_point_sale_Id()
          .then(async (pointId) => {
            if (pointId !== null || pointId !== "") {
              await verify_box(Number(pointId)).then((res) => {
                const boxStatus = res.data.box;
                if (boxStatus && res.data.ok) {
                  if (boxStatus.id) {
                    setIsVisible(true);
                    setIsShowModalClose(true);
                    setBox(boxStatus);
                  } else {
                    setIsVisible(false);
                    setIsShowModalClose(true);
                  }
                } else {
                  setIsVisible(false);
                  setIsShowModalClose(true);
                }
              });
            } else {
              ToastAndroid.show(
                "Error en credenciales de ventas",
                ToastAndroid.LONG
              );
            }
          })
          .catch(() => {
            ToastAndroid.show(
              "Error al obtener point sales",
              ToastAndroid.LONG
            );
          });
      } catch (error) {
        ToastAndroid.show("Error al verificar la caja", ToastAndroid.LONG);
      }
    };
    handleVerifyBox();
    setRefreshing(false);
  }, [refreshing]);

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing;
            }}
          />
        }
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <Text>Welcome home!</Text>
          <View style={styles.centeredView}>
            <Modal visible={showModalClose} animationType="slide">
              <View style={styles.centeredView}>
                  {isVisible ? (
                    <OptionsCloseBox
                      box={box}
                      closeModal={() => {
                        setIsShowModalClose(false);
                      }}
                    />
                  ) : (
                    <AddBox closeModal={() => setIsShowModalClose(false)} />
                  )}
              </View>
            </Modal>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    backgroundColor: "rgba(80, 80, 80, 0.8)",
  },

  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default home;
