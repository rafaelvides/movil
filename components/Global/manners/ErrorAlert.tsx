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
        <View
          style={{ justifyContent: "center", alignItems: "center", padding: 1 }}
        >
          <Text style={styles.alertText}>
            {props.title ??
              "[documentoRelacionado.numeroDocumento] NO EXISTE UN REGISTRO CON ESTE DATO"}
          </Text>

          <Text style={styles.alertMessage}>
            {props.message ??
              "Campo #/identificacion/numeroControl no cumple el tamaÃ±o mÃ­nimo  permitido Campo #/identificacion/numeroControl no cumple el formato requerido Campo #/emisor/codPuntoVentaMH no cumple el tamaÃ±o mÃ­nimo  permitido Campo #/emisor/codPuntoVentaMH contiene un valor invÃ¡lido"}
          </Text>
        </View>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name="shield-alert-outline"
            size={300}
            color={"red"}
            style={{ opacity: 0.08 }}
          />
        </View>
        <View style={{ flexDirection: "row", columnGap: 20, marginTop: 10 }}>
          <View>
            <Button
              withB={180}
              onPress={() => {
                if (props.onPressRetry) {
                  props.onPressRetry();
                }
                props.onClose();
              }}
              Title="Re-intentar"
            />
          </View>
          <View>
            <Button
              withB={180}
              onPress={() => {
                props.onPressVerify?.(), props.onClose();
              }}
              Title="Verificar DTE"
            />
          </View>
          {/* <View>
            <Button
              onPress={() => {
                props.onPressSendContingency?.(), props.onClose();
              }}
              Title="Enviar a contingencia"
            />
          </View> */}
        </View>
        <View style={{ flexDirection: "row", columnGap: 20, marginTop: 10 }}>
          <Button
            withB={200}
            onPress={() => {
              props.onPressSendContingency?.(), props.onClose();
            }}
            Title="Enviar a contingencia"
          />
        </View>
      </Animated.View>
    </View>
  );
};

export default ErrorAlert;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 100,
  },
  alertBox: {
    width: "98%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  alertText: {
    marginBottom: 4,
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
