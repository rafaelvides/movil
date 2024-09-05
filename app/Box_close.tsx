import { save_detail_close_box, verify_box } from "@/services/box.service";
import { useBoxStore } from "@/store/box.store";
import { IBox, ICloseBox, IGetBoxDetail } from "@/types/box/box.types";
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ToastAndroid,
  Alert,
  SafeAreaView,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card } from "react-native-paper";
import { get_box_data, get_point_sale_Id } from "@/plugins/async_storage";
import { ThemeContext } from "@/hooks/useTheme";
import { useFocusEffect, useRouter } from "expo-router";
import CoinCards from "@/components/box/coinCard";
import BoxAccounting from "@/components/box/boxAccounting";
import Button from "@/components/Global/components_app/Button";
import { StatusBar } from "expo-status-bar";
interface Props {
  idBox?: number | undefined;
  closeModal: () => void;
  validation?: boolean
}

const Box_close = (props: Props) => {
  const [boxValues, setBoxValues] = useState<ICloseBox>({
    oneDollar: 0,
    twoDollars: 0,
    fiveDollars: 0,
    tenDollars: 0,
    twentyDollars: 0,
    fiftyDollars: 0,
    hundredDollars: 0,
    oneCents: 0,
    fiveCents: 0,
    tenCents: 0,
    twentyFiveCents: 0,
    fiftyCents: 0,
    oneDollarCents: 0,
    state: "false",
  });
  const { OnRemoveBox } = useBoxStore();
  const [boxPreview, setBoxPreview] = useState<IGetBoxDetail>();
  const [isGroupButton, setIsGroupButton] = useState(false);
  const [box, setBox] = useState<IBox>();
  const router = useRouter();
  const [pointSaleId, setPointSaleId] = useState(0);
  const { theme } = useContext(ThemeContext);
  const [refresh, setRefresh] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setRefresh(true);
    }, [])
  );

  useEffect(() => {
    get_box_data().then((values) => {
      if (values) {
        setBox(values);
      }
    });
    get_point_sale_Id().then((values) => {
      setPointSaleId(Number(values));
    });
    setRefresh(false);
  }, [refresh]);

  const preview_box = () => {
    if (props.idBox) {
      save_detail_close_box(boxValues, props.idBox!)
        .then(({ data }) => {
          if (data.ok) {
            setBoxPreview(data);
            setIsGroupButton(true);
          } else {
            setBoxPreview(undefined);
            setIsGroupButton(false);
            ToastAndroid.show("No se pudo mostrar la caja", ToastAndroid.SHORT);
          }
        })
        .catch(() => {
          setBoxPreview(undefined);
          setIsGroupButton(false);
          ToastAndroid.show("No se pudo cerrar caja error", ToastAndroid.SHORT);
        });
    }
    if (box) {
      save_detail_close_box(boxValues, box.id)
        .then(({ data }) => {
          if (data.ok) {
            setBoxPreview(data);
            setIsGroupButton(true);
          } else {
            setBoxPreview(undefined);
            setIsGroupButton(false);
            ToastAndroid.show("No se pudo mostrar la caja", ToastAndroid.SHORT);
          }
        })
        .catch(() => {
          verify_box(pointSaleId).then(({ data }) => {
            if (!data.box) {
              Alert.alert(
                "No tienes una caja abierta para realizar esta acción"
              );
            }
          });
          setBoxPreview(undefined);
          setIsGroupButton(false);
          ToastAndroid.show("No se pudo cerrar caja error", ToastAndroid.SHORT);
        });
    }
  };

  const completeBox = () => {
    if (props.idBox && props.validation === true ) {
      save_detail_close_box({ ...boxValues, state: "true" }, props.idBox!)
        .then(({ data }) => {
          if (data.ok) {
            OnRemoveBox(),
              ToastAndroid.show("Caja cerrada con éxito", ToastAndroid.SHORT);
              router.navigate("/home");
            props.closeModal();
            setBoxPreview(undefined);
          }
        })
        .catch(() => {
          setBoxPreview(undefined);
          ToastAndroid.show("No se pudo cerrar la caja", ToastAndroid.SHORT);
        });
    }
     if (box && props.validation === true) {
      save_detail_close_box({ ...boxValues, state: "true" }, box.id)
        .then(({ data }) => {
          if (data.ok) {
            OnRemoveBox(),
              ToastAndroid.show("Caja cerrada con éxito", ToastAndroid.SHORT);
            router.navigate("/home");
            props.closeModal()
            setIsGroupButton(false);
            setBoxPreview(undefined);
          }
        })
        .catch(() => {
          setBoxPreview(undefined);
          setIsGroupButton(false);
        });
    }
  };
  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView
        style={{
          width: "102%",
          height: 100,
          flexGrow: 2,
          columnGap: 20,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
          borderColor: "green",
        }}
      >
      {props.validation && (
        <Text style={{
          fontSize: 14, margin:10
        }}>
            Para continuar necesitas cerrar la caja con fecha:  <Text style={{fontSize: 14,
          fontWeight:"bold", color:"red"}}>{box?.date.toString()}</Text>
          </Text>
      )}
        <ScrollView
          style={{
            marginBottom: 14,
            borderRadius: 1,
            borderColor: "green",
          }}
        >
          
          <CoinCards boxValues={boxValues} setBoxValues={setBoxValues} />
        </ScrollView>
        {boxPreview && <BoxAccounting boxPreview={boxPreview} />}
        <View style={{ alignContent: "center", borderBlockColor: "#33C1FF" }}>
          {isGroupButton ? (
            <View
              style={{
                right: 6,
              }}
            >
              <Button
                Title="Cuadrar caja"
                color={theme.colors.dark}
                onPress={() => preview_box()}
              />

              <Button
                onPress={() => completeBox()}
                color={theme.colors.warning}
                Title="Cerrar caja"
              />
            </View>
          ) : (
            <>
              <View style={{}}>
                <Button
                  color={theme.colors.dark}
                  Title="Cerrar caja"
                  onPress={() => preview_box()}
                />
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};
export default Box_close;
