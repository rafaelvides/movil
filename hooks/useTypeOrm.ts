import { useEffect, useState } from "react";
import { connection } from "../offline/db.config";
import { ToastAndroid } from "react-native";

export function useDataBaseInitialize() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    console.log("se ejecuta useDataBaseInitialize", connection.isInitialized);
    async function initializeDataBase() {
      if (!connection || !connection.isInitialized) {
        connection.initialize()
          .then(() => {
            setReady(true);
          })
          .catch((error) => {
            console.log(error)
            setReady(true);
            ToastAndroid.show(
              "Error al inicializar la base de datos",
              ToastAndroid.LONG
            );
          });
          setReady(true);
      } else {
        setReady(true);
      }
    }
    initializeDataBase();

    return () => {
      if (connection) {
        connection.destroy();
      }
      setReady(false);
    };
  }, [connection]);

  return { ready };
}
