import { ThemeContext } from "@/hooks/useTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useContext, useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Text } from "react-native";
import Button from "../components_app/Button";

interface Props {
  message?: string;
  visible: boolean;
  title?: string;
  onPressRetry?: () => void;
  onPressVerify?: () => void;
  onPressSendContingency: () => void;
  onClose: () => void;
}

const ErrorAlert = (props: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { theme } = useContext(ThemeContext);
  useEffect(() => {
    if (props.visible) {
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
      ]).start(() => props.onClose());
    }
  }, [props.visible]);
  if (!props.visible) return null;

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
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <MaterialCommunityIcons
            name="shield-alert-outline"
            size={90}
            color={"red"}
            style={{ opacity: 0.7 }}
          />
          <Text style={styles.alertText}>{props.title}</Text>
          <Text style={styles.alertMessage}>{props.message}</Text>
        </View>
      </Animated.View>
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Button
          onPress={() => {
            if (props.onPressRetry) {
              props.onPressRetry();
            }
            props.onClose();
          }}
          color={theme.colors.warning}
          Title="Re-intentar"
        />
        <Button
          onPress={() => {
            props.onPressVerify?.(), props.onClose();
          }}
          color={theme.colors.secondary}
          Title="Verificar DTE"
        />
        <Button
          onPress={() => {
            props.onPressSendContingency?.(), props.onClose();
          }}
          Title="Enviar contingencia"
        />
        <Button
          onPress={() => props.onClose()}
          Title="Cancelar"
          color={theme.colors.third}
        />
      </View>
    </View>
  );
};

export default ErrorAlert;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    zIndex: 100,
  },
  alertBox: {
    height: "50%",
    marginTop: 40,
  },
  alertText: {
    marginTop: 10,
    marginBottom: 30,
    fontSize: 18,
    textAlign: "center",
    color: "red",
  },
  alertMessage: {
    width: 340,
    fontSize: 16,
    textAlign: "justify",
  },
});
