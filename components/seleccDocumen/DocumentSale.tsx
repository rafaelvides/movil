import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { Dispatch, SetStateAction, useContext } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeContext } from "@/hooks/useTheme";

const DocumentSale = ({
  setContent,
}: {
  setContent: Dispatch<SetStateAction<string>>;
}) => {
  const { theme } = useContext(ThemeContext);

  // const pickDocument = async () => {
  //   let result = await DocumentPicker.getDocumentAsync({
  //     type: "application/json",
  //   });

  //   if (result) {
  //     if (result.assets) {
  //       const { uri } = result.assets[0];
  //       const content_json = await FileSystem.readAsStringAsync(uri, {
  //         encoding: "utf8",
  //       });

  //       const cuerpoDocumentoIndex = content_json.indexOf('"cuerpoDocumento"');
  //       const startArrayIndex = content_json.indexOf("[", cuerpoDocumentoIndex);
  //       const endArrayIndex = content_json.indexOf("],", startArrayIndex) + 1;
  //       const cuerpoDocumentoArray = content_json.substring(
  //         startArrayIndex,
  //         endArrayIndex
  //       );
  //       setContent(cuerpoDocumentoArray);
  //     }
  //   }
  // };
  return (
    <>
      <Pressable
        style={{
          width: 320,
          height: 320,
          borderRadius: 6,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: "#E3E3E3",
        }}
      >
        <MaterialCommunityIcons
          name="file-document-outline"
          size={64}
          color="#E3E3E3"
        />
        <Text style={{ color: "#666666", marginTop: 6 }}>
          Selecciona el archivo JSON
        </Text>
        <Pressable
          style={{
            width: "83%",
            backgroundColor: theme.colors.dark,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 8,
            marginTop: 20,
            padding: 15,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Buscar archivo
          </Text>
        </Pressable>
      </Pressable>
      {/* <Pressable
        onPress={pickDocument}
        style={{
          width: "83%",
          backgroundColor: theme.colors.dark,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 8,
          marginTop: 20,
          padding: 15,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Buscar archivo
        </Text>
      </Pressable> */}
    </>
  );
};

export default DocumentSale;

const styles = StyleSheet.create({});
