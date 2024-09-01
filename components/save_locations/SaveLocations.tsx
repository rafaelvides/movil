import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { Dispatch, SetStateAction, useState } from "react";
import MapView, {
  Callout,
  LatLng,
  MapType,
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import MaterialCommunityIcons from "@expo/vector-icons/build/MaterialCommunityIcons";

const SaveLocations = ({
  setShowModal,
  setLocation,
}: {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setLocation: Dispatch<
    SetStateAction<{ latitude: ""; longitude: "" } | undefined>
  >;
}) => {
  const [touchedPoint, setTouchedPoint] =
    useState<{ latitude: ""; longitude: "" }>();
  const onMapPress = (e: any) => {
    const { nativeEvent } = e;
    const { coordinate } = nativeEvent;
    const { latitude, longitude } = coordinate;

    // Ahora puedes usar las coordenadas del punto tocado
    setTouchedPoint(coordinate);
    setLocation(coordinate);
  };
  return (
    <>
      <StatusBar style="dark" />
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
            setShowModal(false);
          }}
        />
      </Pressable>
      <SafeAreaView
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#fff",
        }}
      >
        <View style={styles.container}>
          <MapView
            style={styles.map}
            zoomEnabled
            provider={PROVIDER_GOOGLE}
            mapType={"standard"}
            initialRegion={{
              latitude: 13.709163,
              longitude: -89.728202,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={onMapPress}
          >
            {touchedPoint !== undefined && (
              <Marker coordinate={touchedPoint! as unknown as LatLng} />
            )}
          </MapView>
          {touchedPoint !== undefined && (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: "15%",
                width: "100%",
                position: "absolute",
                bottom: 10,
              }}
            >
           
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default SaveLocations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
