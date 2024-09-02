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
  sizeIcon,
  radius,
  paddingB,
}: {
  onPress: () => void;
  color?: string;
  icon: string;
  iconColor?: string;
  sizeIcon?: number;
  radius?: number;
  paddingB?: number;
}) => {
  const { theme } = useContext(ThemeContext);
  const C_I = iconColor ? iconColor : "#FFFFFF";
  const size = sizeIcon ? sizeIcon : 20;
  const radiosB = radius ? radius : 10;
  const paddingG = paddingB ? paddingB : padding_global_button.padding;
  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        style={{
          ...styles.buttonStyle,
          borderRadius: radiosB,
          padding: paddingG,
          backgroundColor: color ? color : theme.colors.dark,
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={size}
          color={C_I}
          style={{
            right: 1,
            top: 0,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default ButtonForCard;

const styles = StyleSheet.create({
  buttonStyle: {
    // borderRadius: 10,
    // padding: padding_global_button.padding,
    margin: 12,
  },
});
