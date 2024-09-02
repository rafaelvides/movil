import { StyleSheet, View } from "react-native";
import React, { Dispatch, SetStateAction, useContext } from "react";
import { ThemeContext } from "@/hooks/useTheme";
import Button from "@/components/Global/components_app/Button";

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
  const handleClose = () => {
    setIsModalButtons(false);
  };

  return (
    <View>
      {isModalButtons === true && (
        <View style={styles.viewBotton}>
          <Button
            withB={160}
            onPress={() => {
              handleClose();
              openModal();
              setTypeClient("normal");
            }}
            Title="Cliente Normal"
            color={theme.colors.dark}
          />
          <Button
            withB={190}
            onPress={() => {
              handleClose();
              openModal();
              setTypeClient("contribuyente");
            }}
            Title="Cliente contribuyente"
            color={theme.colors.dark}
          />
        </View>
      )}
    </View>
  );
};

export default ButtonDual;

const styles = StyleSheet.create({
  viewBotton: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    gap: 30,
  },
});
