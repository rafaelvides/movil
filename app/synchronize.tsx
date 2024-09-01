import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react-native";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
// import { useSalesOfflineStore } from "@/offline/store/sales_offline.store";
import { useFocusEffect } from "expo-router";
import { useBillingStore } from "@/store/billing/billing.store";
// import ComplementSale from "@/offline/components/sales/ComplementSale";
import { useTransmitterStore } from "@/store/transmitter.store";
import { get_box_data } from "@/plugins/async_storage";
import { useEmployeeStore } from "@/store/employee.store";
import SpinnerInitPage from "@/components/Global/SpinnerInitPage";

const synchronize = () => {
  const [showModalContingencia, setShowModalContingencia] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [is_refresh, setIsRefresh] = useState(false);
  const [isReloadind, setIsReloading] = useState(false);

  const { OnGetCat005TipoDeContingencia } = useBillingStore();
  const { OnGetTransmitter, transmitter } = useTransmitterStore();
  const { OnGetEmployeesList } = useEmployeeStore();

  useFocusEffect(
    React.useCallback(() => {
      setIsRefresh(true);
      setIsReloading(true)
      setTimeout(() => {
        setIsReloading(false);
      }, 1000);
    }, [])
  );

  useEffect(() => {
    (async () => {
      await get_box_data().then((data) => {
        if (!data?.id) {
          ToastAndroid.show("No tienes caja asignada", ToastAndroid.LONG);
          return;
        }
     
      });
    })();
    OnGetCat005TipoDeContingencia();
    OnGetTransmitter();
    OnGetEmployeesList();
    setIsRefresh(false);
  }, [is_refresh]);

  const UpdatePagingProcess = () => {
    setIsRefresh(true);
    setShowModalContingencia(false);
    setIsProcessing(false);
  };
  return (
    <>
      {isReloadind ? (
        <>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
          >
            <SpinnerInitPage />
          </View>
        </>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <View
              style={{
                width: "100%",
                height: "88%",
                backgroundColor: "#eee",
                padding: 20,
              }}
            >

            </View>
            <View
              style={{
                width: "100%",
                backgroundColor: "#fff",
                borderTopWidth: 1,
                borderColor: "#ddd",
                padding: 5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isProcessing ? (
                <View
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <ActivityIndicator size="large"></ActivityIndicator>
                  <Text>Sincronizando...</Text>
                </View>
              ) : (
                <>
                  <Pressable
                    onPress={() => {
                      setShowModalContingencia(true);
                    }}
                    style={{
                      width: "100%",
                      padding: 16,
                      borderRadius: 4,
                      marginTop: 8,
                      backgroundColor: "#1d4ed8",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      Iniciar sincronización
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
          <Modal visible={showModalContingencia} animationType="fade">
            <View
              style={{
                width: "100%",
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "flex-end",
                paddingHorizontal: 20,
              }}
            >
              <Pressable onPress={() => setShowModalContingencia(false)}>
                <X size={28} color={"#000"} />
              </Pressable>
            </View>
            {/* <ComplementSale
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              UpdatePagingProcess={UpdatePagingProcess}
              processed_sales={sales_offline_pag}
              transmitter={transmitter}
            /> */}
          </Modal>
        </View>
      )}
    </>
  );
};

export default synchronize;

const styles = StyleSheet.create({
  card: {
    height: "auto",
    marginBottom: 25,
    padding: 5,
    width: "95%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
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
