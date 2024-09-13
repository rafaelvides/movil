import Box_close from "@/app/Box_close";
import { ThemeContext } from "@/hooks/useTheme";
import { box_data } from "@/plugins/async_storage";
import { useBoxStore } from "@/store/box.store";
import { IBox } from "@/types/box/box.types";
import { useContext, useState } from "react";
import { View, Text, ToastAndroid, Modal } from "react-native";
import { useTheme } from "react-native-paper";
import Button from "../Global/components_app/Button";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

const OptionsCloseBox = ({
  box,
  closeModal,
}: {
  closeModal: () => void;
  box?: IBox;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showCloseModal, setShowModalClose] = useState(false);
  const { OnCloseBox, OnRemoveBox } = useBoxStore();
  const { theme } = useContext(ThemeContext);
const [isModal, setIsModal] = useState(false)
const router = useRouter()

  const handleCloseBoxId = () => {
    OnCloseBox(Number(box?.id));
    OnRemoveBox();
    closeModal();
    router.navigate("/home")
  };



  const handleActivate = () => {
    box_data(box!);
    closeModal();
    router.navigate("/home")
    
  };

  const handleCloseAddBox = () => {
    closeModal();
    closeModal();
    router.navigate("/home")
  };

  return (
    <>
      <View
        style={{
          justifyContent: "center",
          width: 280,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 18,
              textAlign: "center",
              fontWeight: "bold",
              color: "#1359",
            }}
          >
            Esta sucursal cuenta con una caja activa
          </Text>
        </View>
        <View
          style={{
            alignContent: "center",
            marginBottom: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ textAlign: "center" }}>
            Puedes cerrar la caja y activar una nueva o puedes usar la caja
            activa
          </Text>
        </View>
        <View>
          {showModal ? (
            <View
              style={{
                marginTop: 20,
                alignItems: "center",
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              <Button
                withB={300}
                onPress={() => {setShowModalClose(true)
                  setIsModal(true)
                }}
                Title="Cierre contabilizado"
              />
              <Button
                withB={300}
                onPress={handleCloseBoxId}
                Title="Solo cerrar caja"
                color={theme.colors.danger}
              />
            </View>
          ) : (
            <>
              <View
                style={{
                  marginTop: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  alignContent: "center",
                }}
              >
                <Button
                  withB={300}
                  onPress={() => setShowModal(true)}
                  Title="Métodos de cierre"
                />
                <Button
                  withB={300}
                  onPress={handleActivate}
                  Title="Usar caja activa"
                  color={theme.colors.third}
                />
              </View>
            </>
          )}
        </View>
      </View>
      <Modal visible={showCloseModal} animationType="slide" transparent={false}>
        <Box_close idBox={box?.id} closeModal={() => handleCloseAddBox()} isModal={isModal} />
      </Modal>
    </>
  );
};

export default OptionsCloseBox;
