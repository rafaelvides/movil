import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";

const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle> | undefined;
}) => {
    const combinedStyle = StyleSheet.compose(styles.card, style);

  return (
    <View
      style={combinedStyle}
    >
      <View style={{ justifyContent: "center" }}>{children}</View>
    </View>
  );
};
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default Card;
