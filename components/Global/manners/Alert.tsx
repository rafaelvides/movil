import React, { useRef, useEffect } from "react";
import { View, Text, Animated, Button, StyleSheet } from "react-native";

const AlertWithAnimation = ({
  visible,
  title,
  onPress,
  onClose,
}: {
  title: string;
  visible: boolean;
  onPress: () => void;
  onClose: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onClose());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.alertBox,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.alertText}>{title}</Text>
        <View style={{ flexDirection: "row", gap: 40, marginTop: 20 }}>
          <Button title="cancelar" onPress={onClose} />
          <Button
            title="eliminar"
            onPress={() => {
              onPress()
              onClose()
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
};

export default AlertWithAnimation;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  alertBox: {
    width: 320,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  alertText: {
    marginBottom: 10,
    fontSize: 16,
    textAlign: "center",
  },
});
