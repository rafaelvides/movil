import * as LocalAuthentication from "expo-local-authentication";
import { View, ToastAndroid, Pressable } from "react-native";
import { useAuthStore } from "../../store/auth.store";
import { get_data_biometric } from "../../plugins/secure_store";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

enum EResult {
  CANCELLED = "CANCELLED",
  DISABLED = "DISABLED",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
}
interface IProps {
  setLoading: Dispatch<SetStateAction<boolean>>;
}

const AuthenticationTouch = ({ setLoading }: IProps) => {
  const { OnMakeLogin } = useAuthStore();
  const [facialRecognition, setFacialRecognition] = useState(false);

  const [fingerprintAvailable, setFingerprintAvailable] = useState(false);
  const [irisAvailable, setIrisAvailable] = useState(false);

  const [result, setResult] = useState<EResult>();
  const checkSupportedAutentication = async () => {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types && types.length > 0) {
      setFacialRecognition(
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      );
      setFingerprintAvailable(
        types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      );
      setIrisAvailable(
        types.includes(LocalAuthentication.AuthenticationType.IRIS)
      );
    } else {
      ToastAndroid.show(
        "No tienes habilitada la utenticación biométrica",
        ToastAndroid.LONG
      );
      setResult(EResult.ERROR);
    }
  };
  useEffect(() => {
    get_data_biometric("authBiometric").then((data) => {});
  }, []);
  useEffect(() => {
    get_data_biometric("authBiometric").then((data) => {});
  }, []);
  async function authenticationLogin() {
    try {
      setLoading(true);
      const results = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login con huella APP Facturación",
      });

      if (results.success) {
        const payload = await get_data_biometric("authBiometric");
        if (payload) {
          const loginSuccess = await OnMakeLogin(payload);
          if (loginSuccess) {
            setResult(EResult.SUCCESS);
            setLoading(false);
          } else {
            setResult(EResult.ERROR);
            setLoading(false);
          }
        } else {
          ToastAndroid.show(
            "No tienes habilitada la utenticación biométrica1",
            ToastAndroid.LONG
          );
          setResult(EResult.ERROR);
          setLoading(false);
        }
      } else if (results.error === "unknown") {
        ToastAndroid.show("Ocurrió un error inesperado", ToastAndroid.LONG);
        setResult(EResult.ERROR);
        setLoading(false);
      } else if (
        results.error === "user_cancel" ||
        results.error === "system_cancel" ||
        results.error === "app_cancel"
      ) {
        ToastAndroid.show(
          "La autenticación biométrica ha sido cancelada.",
          ToastAndroid.SHORT
        );
        setResult(EResult.CANCELLED);
        setLoading(false);
      }
    } catch (error) {
      ToastAndroid.show(
        "Ocurrio un error con la biométrica",
        ToastAndroid.LONG
      );
      setResult(EResult.ERROR);
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await checkSupportedAutentication();
    })();
  }, []);

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {facialRecognition || fingerprintAvailable || irisAvailable ? (
          <>
            <Pressable
              style={{
                marginBottom: 20,
                backgroundColor: "#046321",
                width: 45,
                height: 45,
                borderRadius: 10,
              }}
              onPress={() => authenticationLogin()}
            >
              <MaterialCommunityIcons
                name="fingerprint"
                size={24}
                style={{
                  position: "absolute",
                  left: 13,
                  top: "60%",
                  marginLeft: -3,
                  color: "white",
                  transform: [{ translateY: -15 }],
                }}
              />
            </Pressable>
          </>
        ) : null}
      </View>
    </>
  );
};

export default AuthenticationTouch;
