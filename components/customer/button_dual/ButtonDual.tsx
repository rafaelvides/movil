import { StyleSheet, Text, View } from "react-native";
import React, { Dispatch, SetStateAction, useContext } from "react";
import { ThemeContext } from "@/hooks/useTheme";

const ButtonDual = ({
  setTypeClient,
  openModal,
  setIsModalButtons,
  isModalButtons,
}: {
  setTypeClient: Dispatch<SetStateAction<string>>;
  setIsModalButtons: Dispatch<SetStateAction<boolean>>;
  openModal: () => void;
  isModalButtons: boolean;
}) => {
  const { theme } = useContext(ThemeContext);
  console.log(isModalButtons);
  const handleClose = () => {
    setIsModalButtons(false);
  };

  return (
    <View>
      {isModalButtons === true && (
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "center",
            gap: 30,
          }}
        >
        
         
        </View>
      )}
    </View>
  );
};

export default ButtonDual;

const styles = StyleSheet.create({});
