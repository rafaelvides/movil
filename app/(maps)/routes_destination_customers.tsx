import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { createSocket } from "@/hooks/useSocket";
import MapView, {
  Callout,
  MapType,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { useLocationStore } from "@/store/locations.store";
import { useBranchStore } from "@/store/branch.store";
import { ThemeContext } from "@/hooks/useTheme";
import { useFocusEffect } from "expo-router";
import { update_active_location } from "@/services/locations.service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SheetManager } from "react-native-actions-sheet";
import SpinnerLoadinMaps from "@/components/Global/SpinnerLoadinMaps";
import { StatusBar } from "expo-status-bar";
import MapViewDirections, {
  MapDirectionsResponse,
} from "react-native-maps-directions";
import { API_KEY } from "@/utils/constants";
import { useCustomerStore } from "@/store/customer.store";
import { ICustomer } from "@/types/customer/customer.types";
import { get_branch_id } from "@/plugins/async_storage";
import HTMLView from "react-native-htmlview";
import * as Speech from "expo-speech";
import ButtonForCard from "@/components/Global/components_app/ButtonForCard";

const routes_destination_customers = () => {
  const [loading, setLoading] = useState(false);
  const socket = createSocket();
  const [refreshing, setRefreshing] = useState(false);
  const [showModalMap, setShowModalMap] = useState(false);
  const [steps, setSteps] = useState(false);
  const [checked, setChecked] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer>();
  const [selectedOptionMap, setSelectedOptionMap] =
    useState<MapType>("standard");
  const { OnGetLocation, coordinatesRealTime } = useLocationStore();
  const { OnGetBranchList } = useBranchStore();
  const { theme } = useContext(ThemeContext);
  const { OnGetCustomersList } = useCustomerStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [detail, setDetail] = useState<MapDirectionsResponse>();
  const [endRoutePoint, setEndRoutePoint] = React.useState<{
    latitude: number;
    longitude: number;
  }>();
  const [startRoutePoint, setStartRoutePoint] = React.useState<{
    latitude: number;
    longitude: number;
  }>();

  useFocusEffect(
    React.useCallback(() => {
      setSelectedOptionMap("standard");
      setSelectedCustomer(undefined);
      setDetail(undefined);
      setLoading(true);
      setRefreshing(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, [])
  );
  useEffect(() => {
    socket.on("reload", () => {
      if (checked) {
        get_branch_id().then((data) => {
          OnGetLocation(Number(data) ?? 0);
        });
        update_active_location(1, true);
      }
    });

    return () => {
      socket.off("reload");
      socket.disconnect();
    };
  }, [checked]);

  useEffect(() => {
    OnGetBranchList();
    OnGetCustomersList();
    if (!checked) {
      get_branch_id().then((data) => {
        OnGetLocation(Number(data) ?? 0);
      });
    }
    setRefreshing(false);
  }, [refreshing]);

  const endmarkerCoordinates = {
    latitude: Number(selectedCustomer?.latitude!),
    longitude: Number(selectedCustomer?.longitude!),
  }; // Coordenadas del marcador fuera de la calle

  const startmarkerCoordinates = {
    latitude: Number(coordinatesRealTime?.latitude!),
    longitude: Number(coordinatesRealTime?.longitude!),
  };

  const locationFinal = {
    latitude: Number(selectedCustomer?.latitude ?? 0),
    longitude: Number(selectedCustomer?.longitude ?? 0),
  };

  const generateCurvePoints = (start: any, end: any) => {
    const controlPoints = [];
    const numPoints = 20; // Número de puntos intermedios para suavizar la curva

    // Punto medio entre el inicio y el fin, desplazado para crear la curvatura
    const midpoint = {
      latitude: (start.latitude + end.latitude) / 2 + 0.00002, // Ajusta para cambiar la "pansita"
      longitude: (start.longitude + end.longitude) / 2 - 0.00002, // Ajusta para cambiar la "pansita"
    };

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const lat =
        (1 - t) * (1 - t) * start.latitude +
        2 * (1 - t) * t * midpoint.latitude +
        t * t * end.latitude;
      const lng =
        (1 - t) * (1 - t) * start.longitude +
        2 * (1 - t) * t * midpoint.longitude +
        t * t * end.longitude;
      controlPoints.push({ latitude: lat, longitude: lng });
    }

    return controlPoints;
  };

  //13.7400478 -89.7129031
  useEffect(() => {
    if (detail?.legs[0].steps !== undefined) {
      const steps = detail?.legs[0].steps;
      if (steps.length > 0 && coordinatesRealTime) {
        const currentStep = steps[currentStepIndex];
        const distance = getDistance(
          coordinatesRealTime.latitude,
          coordinatesRealTime.longitude,
          currentStep.end_location.lat,
          currentStep.end_location.lng
        );
        if (distance < 5) {
          // Ajusta la distancia según sea necesario
          Speech.speak(currentStep.html_instructions.replace(/<[^>]*>?/gm, "")); // o Tts.speak(currentStep.instructions);
          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
          }
        }
      }
    }
  }, [coordinatesRealTime, detail, currentStepIndex, refreshing]);

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  };

  const repeatCurrentStep = () => {
    if (detail?.legs[0].steps) {
      const steps = detail?.legs[0].steps;
      if (steps.length > currentStepIndex) {
        const step = steps[currentStepIndex];
        Speech.speak(step.html_instructions.replace(/<[^>]*>?/gm, "")); // o Tts.speak(step.html_instructions.replace(/<[^>]*>?/gm, ""));
      }
    }
  };
  return (
    <>
      <StatusBar style="dark" />
      {loading ? (
        <>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
          >
            <SpinnerLoadinMaps />
          </View>
        </>
      ) : (
        <>
          <SafeAreaView
            style={{
              width: "100%",
              height: 70,
              backgroundColor: "#fff",
              paddingHorizontal: 8,
            }}
          >
            <Pressable
              onPress={() =>
                SheetManager.show("routes-destination-filters-sheet", {
                  payload: {
                    setSelectedCustomer,
                    selectedCustomer: selectedCustomer,
                    selectedOptionMap: selectedOptionMap,
                    setSelectedOptionMap,
                    setChecked,
                    checked: checked,
                    handleConfirm(
                      selectedOptionMap,
                      selectedCustomer,
                      checked
                    ) {
                      setSelectedCustomer(selectedCustomer);
                      setSelectedOptionMap(selectedOptionMap);
                      setChecked(checked);
                      setRefreshing(true);
                      SheetManager.hide("routes-destination-filters-sheet");
                    },
                  },
                })
              }
              style={styles.filter}
            >
              <Text
                style={{
                  color: "#718096",
                  fontSize: 16,
                }}
              >
                Filtros disponibles
              </Text>
              <Pressable
                style={{
                  position: "absolute",
                  right: 20,
                }}
              >
                <MaterialCommunityIcons
                  name="filter"
                  size={25}
                  color="#607274"
                />
              </Pressable>
            </Pressable>
          </SafeAreaView>

          <View style={styles.container}>
            <MapView
              style={styles.map}
              zoomEnabled
              provider={PROVIDER_GOOGLE}
              mapType={selectedOptionMap}
              initialRegion={{
                latitude: coordinatesRealTime.latitude
                  ? coordinatesRealTime.latitude
                  : 13.709163,
                longitude: coordinatesRealTime.longitude
                  ? coordinatesRealTime.longitude
                  : -89.728202,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {coordinatesRealTime.longitude &&
                coordinatesRealTime.latitude &&
                selectedCustomer?.latitude &&
                selectedCustomer?.latitude !== "0" &&
                selectedCustomer?.longitude &&
                selectedCustomer?.longitude !== "0" && (
                  <>
                    <Marker coordinate={coordinatesRealTime} />
                    <Marker coordinate={locationFinal}>
                      <Callout style={{ width: 150 }}>
                        <Text
                          style={{
                            marginLeft: 25,
                            fontSize: 15,
                          }}
                        >
                          Mi ubicación
                        </Text>
                        <Text>Duración: {detail?.legs[0].duration.text}</Text>
                        <Text>Distancia: {detail?.legs[0].distance.text}</Text>
                        <Text>
                          Tiempo por trafico: {detail?.legs[0].duration.text}
                        </Text>
                      </Callout>
                    </Marker>
                    {startRoutePoint && (
                      <Polyline
                        coordinates={generateCurvePoints(
                          startRoutePoint,
                          startmarkerCoordinates
                        )}
                        strokeColor="#b4b4b4"
                        strokeWidth={5}
                        lineDashPattern={[2, 6]}
                      />
                    )}
                    <MapViewDirections
                      origin={coordinatesRealTime}
                      timePrecision={"now"}
                      mode="DRIVING"
                      destination={locationFinal}
                      apikey={API_KEY}
                      strokeWidth={7}
                      strokeColor="#00826a"
                      optimizeWaypoints={true}
                      language="es"
                      onReady={(result) => {
                        // handleDirectionsReady(result);
                        setDetail(result);
                        const lastPoint =
                          result.coordinates[result.coordinates.length - 1];
                        const lastPointStart = result.coordinates[0];
                        setEndRoutePoint(lastPoint);
                        setStartRoutePoint(lastPointStart);
                      }}
                      onError={(errorMessage) => {
                        ToastAndroid.show(
                          `Error: ${errorMessage}`,
                          ToastAndroid.LONG
                        );
                      }}
                    />
                    {endRoutePoint && (
                      <Polyline
                        coordinates={generateCurvePoints(
                          endRoutePoint,
                          endmarkerCoordinates
                        )}
                        strokeColor="#b4b4b4"
                        strokeWidth={5}
                        lineDashPattern={[2, 6]}
                      />
                    )}
                  </>
                )}
            </MapView>
          </View>
          {selectedCustomer && (
            <>
              <View
                style={{
                  position: "absolute",
                  bottom: 20,
                  right: 10,
                }}
              >
                <ButtonForCard
                  onPress={() => setShowModalMap(true)}
                  icon="arrow-expand-all"
                  radius={25}
                  paddingB={15}
                  color={theme.colors.warning}
                />
                <ButtonForCard
                  onPress={() => {
                    setSelectedCustomer(undefined);
                    setSelectedOptionMap("standard");
                  }}
                  icon="broom"
                  radius={25}
                  paddingB={15}
                />
                {detail && (
                  <>
                    <ButtonForCard
                      onPress={repeatCurrentStep}
                      icon="cached"
                      radius={25}
                      paddingB={15}
                      color={theme.colors.third}
                    />
                    <ButtonForCard
                      onPress={() => setSteps(true)}
                      icon="format-list-bulleted"
                      radius={25}
                      paddingB={15}
                      color={theme.colors.secondary}
                    />
                  </>
                )}
              </View>
            </>
          )}
        </>
      )}
      <Modal visible={showModalMap} animationType="fade">
        <MapView
          style={styles.map}
          zoomEnabled
          provider={PROVIDER_GOOGLE}
          mapType={selectedOptionMap}
          initialRegion={{
            latitude: coordinatesRealTime.latitude
              ? coordinatesRealTime.latitude
              : 13.709163,
            longitude: coordinatesRealTime.longitude
              ? coordinatesRealTime.longitude
              : -89.728202,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {coordinatesRealTime.longitude &&
            coordinatesRealTime.latitude &&
            selectedCustomer?.latitude &&
            selectedCustomer?.latitude !== "0" &&
            selectedCustomer?.longitude &&
            selectedCustomer?.longitude !== "0" && (
              <>
                <Marker coordinate={coordinatesRealTime} />
                <Marker coordinate={locationFinal}>
                  <Callout style={{ width: 150 }}>
                    <Text
                      style={{
                        marginLeft: 25,
                        fontSize: 15,
                      }}
                    >
                      Mi ubicación
                    </Text>
                    <Text>Duración: {detail?.legs[0].duration.text}</Text>
                    <Text>Distancia: {detail?.legs[0].distance.text}</Text>
                    <Text>
                      Tiempo por trafico: {detail?.legs[0].duration.text}
                    </Text>
                  </Callout>
                </Marker>
                {startRoutePoint && (
                  <Polyline
                    coordinates={generateCurvePoints(
                      startRoutePoint,
                      startmarkerCoordinates
                    )}
                    strokeColor="#b4b4b4"
                    strokeWidth={5}
                    lineDashPattern={[2, 6]}
                  />
                )}
                <MapViewDirections
                  mode="WALKING"
                  origin={coordinatesRealTime}
                  timePrecision={"now"}
                  destination={locationFinal}
                  apikey={API_KEY}
                  strokeWidth={7}
                  strokeColor="#00826a"
                  optimizeWaypoints={true}
                  language="es"
                  onReady={(result) => {
                    setDetail(result);
                    const lastPoint =
                      result.coordinates[result.coordinates.length - 1];
                    const lastPointStart = result.coordinates[0];
                    setEndRoutePoint(lastPoint);
                    setStartRoutePoint(lastPointStart);
                  }}
                  onError={(errorMessage) => {
                    ToastAndroid.show(
                      `Error: ${errorMessage}`,
                      ToastAndroid.LONG
                    );
                  }}
                />
                {endRoutePoint && (
                  <Polyline
                    coordinates={generateCurvePoints(
                      endRoutePoint,
                      endmarkerCoordinates
                    )}
                    strokeColor="#b4b4b4"
                    strokeWidth={5}
                    lineDashPattern={[2, 6]}
                  />
                )}
              </>
            )}
        </MapView>
        {selectedCustomer && (
          <>
            <View
              style={{
                position: "absolute",
                bottom: 20,
                right: 10,
              }}
            >
              <ButtonForCard
                onPress={() => setShowModalMap(false)}
                icon="arrow-collapse-all"
                radius={25}
                paddingB={15}
                color={theme.colors.warning}
              />
              <ButtonForCard
                onPress={() => {
                  setSelectedCustomer(undefined);
                  setSelectedOptionMap("standard");
                }}
                icon="broom"
                radius={25}
                paddingB={15}
              />
              {detail && (
                <>
                  <ButtonForCard
                    onPress={repeatCurrentStep}
                    icon="cached"
                    radius={25}
                    paddingB={15}
                    color={theme.colors.third}
                  />
                  <ButtonForCard
                    onPress={() => setSteps(true)}
                    icon="format-list-bulleted"
                    radius={25}
                    paddingB={15}
                    color={theme.colors.secondary}
                  />
                </>
              )}
            </View>
          </>
        )}
      </Modal>
      <Modal visible={steps} animationType="fade">
        <Pressable
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            marginBottom: 40,
            zIndex: 5,
          }}
        >
          <MaterialCommunityIcons
            color={"#2C3377"}
            name="close"
            size={30}
            onPress={() => {
              setSteps(false);
            }}
          />
        </Pressable>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ fontWeight: "600" }}>
            Pasos a seguir para llegar al destino
          </Text>
        </View>
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#d3d3d3",
            marginTop: 10,
          }}
        />
        {detail?.legs &&
          detail.legs.map((data) => (
            <>
              <ScrollView
                style={{
                  marginBottom: 10,
                }}
              >
                {data.steps.map((res) => (
                  <>
                    <View style={{ margin: 25, marginTop: 20 }}>
                      <HTMLView
                        value={res.html_instructions}
                        style={{ width: "100%" }}
                      />
                    </View>
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: "#d3d3d3",
                      }}
                    />
                  </>
                ))}
              </ScrollView>
            </>
          ))}
      </Modal>
    </>
  );
};

export default routes_destination_customers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  filter: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingLeft: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    height: 56,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  containerB: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
});
