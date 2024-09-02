import { View, TouchableOpacity, StyleSheet } from "react-native";
import React, { useContext } from "react";
import { padding_global_button } from "../styles/responsiveButton";
import { ThemeContext } from "@/hooks/useTheme";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const ButtonForCard = ({
  onPress,
  color,
  icon,
  iconColor,
  sizeIcon
}: {
  onPress: () => void;
  color?: string;
  icon: string;
  iconColor?: string
  sizeIcon?: number
}) => {
  const { theme } = useContext(ThemeContext);
  const C_I = iconColor ? iconColor : "#FFFFFF"
  const size = sizeIcon ? sizeIcon : 24
  return (
    <View style={{ width: 68, height: 68 }}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          ...styles.buttonStyle,
          backgroundColor: color ? color : theme.colors.dark,
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={size}
          color={C_I}
          style={{
            right: 2,
            top: -2,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default ButtonForCard;

const styles = StyleSheet.create({
  buttonStyle: {
    borderRadius: 25,
    padding: padding_global_button.padding,
    margin: 10,
  },
});
