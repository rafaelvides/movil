import { ThemeContext } from "@/hooks/useTheme";
import React, { useRef, useEffect, useContext } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

const  AlertDownload = ({
  visible,
  title,
  onPress,
  onClose,
}: {
  title?: string;
  visible: boolean;
  onPress: () => void;
  onClose: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { theme } = useContext(ThemeContext);
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
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
          <Button style={{ backgroundColor:theme.colors.dark, borderRadius:14 , width:140}} onPress={onClose}>
            <Text style={{color:"white"}}>Cancelar</Text>
          </Button>
          <Button
            style={{ backgroundColor: theme.colors.danger,borderRadius:14 , width:140}}
            onPress={() => {
              onPress();
              onClose();
            }}
          >
            <Text style={{color:"white"}}>Descargar</Text>
          </Button>
        </View>
      </Animated.View>
    </View>
  );
};

export default AlertDownload;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",

  },
  alertBox: {
    width: 350,
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
