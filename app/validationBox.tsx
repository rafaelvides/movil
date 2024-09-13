import stylesGlobals from "@/components/Global/styles/StylesAppComponents";
import { get_box_data, get_point_sale_Id } from "@/plugins/async_storage";
import { verify_box } from "@/services/box.service";
import { IBox } from "@/types/box/box.types";
import { formatDate } from "@/utils/date";
import { useEffect, useState } from "react";
import { Modal, View ,StyleSheet, ToastAndroid} from "react-native";
import Box_close from "./Box_close";
import Card from "@/components/Global/components_app/Card";
import OptionsCloseBox from "@/components/box/OptionsCloseBox";
import AddBox from "@/components/box/AddBox";

const validation = () => {
  const [box, setBox] = useState<IBox | null>(null);
  const [boxCloseDate, setBoxCloseDate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showModalClose, setIsShowModalClose] = useState(false);

  useEffect(() => {
    get_box_data().then((data) => {
      if (data) {
        setBox(data);
        if (data.date.toString() !== formatDate()) {
          setBoxCloseDate(true);
        } else {
          setBoxCloseDate(false);
          handleVerifyBox();
        }
      } else {
        handleVerifyBox();
      }
    });
  }, []);

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
          ToastAndroid.show("Error al obtener point sales", ToastAndroid.LONG);
        });
    } catch (error) {
      ToastAndroid.show("Error al verificar la caja", ToastAndroid.LONG);
    }
  };

  return (
    <>
      {boxCloseDate ? (
        <Modal visible={boxCloseDate} animationType="slide" transparent={false}>
          <Box_close
            idBox={box?.id}
            closeModal={() => {
              setBoxCloseDate(false);
              setIsShowModalClose(false);
            }}
            validation={true}
            isModal={true}
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
                  box={box ?? undefined}
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
    </>
  );
};
export default validation;


const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 20,
      backgroundColor: "rgba(80, 80, 80, 0.8)",
    },
  });
