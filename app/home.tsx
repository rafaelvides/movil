import AddBox from "@/components/box/AddBox";
import OptionsCloseBox from "@/components/box/OptionsCloseBox";
import Card from "@/components/Global/components_app/Card";
import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import { ThemeContext } from "@/hooks/useTheme";
import {
  box_data,
  get_box_data,
  get_point_sale_Id,
} from "@/plugins/async_storage";
import { is_auth, return_token } from "@/plugins/secure_store";
import { verify_box } from "@/services/box.service";
import { get_theme_by_transmitter } from "@/services/personalization.service";
import { IBox } from "@/types/box/box.types";
import { formatDate } from "@/utils/date";
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
import Box_close from "./Box_close";
import { useFocusEffect } from "expo-router";

function home() {
  const [refreshing, setRefreshing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showModalClose, setIsShowModalClose] = useState(false);
  const [box, setBox] = useState<IBox>();
  const [boxCloseDate, setBoxCloseDate] = useState(false);
  const { toggleTheme } = useContext(ThemeContext);

  useFocusEffect(
    React.useCallback(() => {
      get_box_data().then((data) => {
        setBox(data);
      });
    }, [])
  );

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
    const dateBoxClose = () => {
      if (box && box.date !== new Date(currentDate)) {
        setBoxCloseDate(true);
      } else {
        setBoxCloseDate(false);
      }
    };
    dateBoxClose();
  }, [box]);

  const currentDate = formatDate();

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

  useEffect(() => {
    return_token().then((da) => console.log("home", da));
    is_auth().then((dat) => console.log("home", dat));
  }, []);

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
          {boxCloseDate === true ? (
            <Modal
              visible={boxCloseDate}
              animationType="slide"
              transparent={false}
            >
              <Box_close
                idBox={box?.id}
                closeModal={() => {
                  setBoxCloseDate(false);
                  setIsShowModalClose(false);
                }}
                validation={true}
              />
            </Modal>
          ) : (
            <Modal visible={showModalClose} animationType="slide">
              <View style={styles.centeredView}>
                <Card
                  style={{
                    width: stylesGlobals.styleCard.width,
                    height: 340,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
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
                </Card>
              </View>
            </Modal>
          )}
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
});

export default home;
