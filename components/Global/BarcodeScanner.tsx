import { View, Text, Button, Modal, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Camera, CameraView, BarcodeScanningResult } from "expo-camera";

type Props = {
  setShowScanner: React.Dispatch<React.SetStateAction<boolean>>;
  setScanned: React.Dispatch<React.SetStateAction<boolean>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: boolean;
  showScanner: boolean;
  scanned: boolean;
  search: (text: string) => void;
};

const BarcodeScanner = (props: Props) => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async (res: BarcodeScanningResult) => {
    props.setShowScanner(false);
    props.setScanned(false);
    props.setShowModal(false);
    props.search(res.data);
  };
  return (
    <>
      {props.showScanner && (
        <Modal visible={props.showModal} animationType="fade">
          <View style={{ flex: 1 }}>
            <CameraView
              onTouchMove={() => props.setShowScanner(false)}
              barcodeScannerSettings={{
                barcodeTypes: [
                  "code128",
                  "codabar",
                  "code39",
                  "code93",
                  "ean13",
                  "ean8",
                  "upc_a",
                  "upc_e",
                ],
              }}
              onBarcodeScanned={handleBarCodeScanned}
              style={{
                // width: 300,
                height: "100%",
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <View style={{justifyContent: "center", alignItems: "center", zIndex :10}}>
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 50,
                    fontSize: 18,
                    color: "#fff",
                  }}
                >
                  Escanear producto
                </Text>
              </View>
              <Pressable
                style={{
                  position: "absolute",
                  bottom: 60,
                  right: 30,
                }}
                onPress={() => props.setShowScanner(false)}
              >
                <MaterialCommunityIcons name="close" size={45} color="white" />
              </Pressable>
            </CameraView>
            {props.scanned && (
              <Button
                title={"Volver a escanear"}
                onPress={() => props.setScanned(false)}
              />
            )}
          </View>
        </Modal>
      )}
    </>
  );
};

export default BarcodeScanner;
