import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import React, { useContext } from "react";
import { button_global, padding_global } from "../styles/responsiveButton";
import { ThemeContext } from "@/hooks/useTheme";

const Button = ({
  onPress,
  Title,
  color,
  withB
}: {
  onPress: () => void;
  Title: string;
  color?: string;
  withB?: number;
}) => {
  const { theme } = useContext(ThemeContext);
const widthButton = withB ? withB : button_global.width
  return (
    <View style={{ width: widthButton }}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          ...styles.buttonStyle,
          backgroundColor: color ? color : theme.colors.dark,
        }}
      >
        <Text style={styles.textStyle}>{Title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Button;

const styles = StyleSheet.create({
  buttonStyle: {
    borderRadius: 25,
    padding: padding_global.padding,
    margin: 10,
  },
  textStyle: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
