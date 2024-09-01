import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const StackMenu = () => {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        {/* <Stack.Screen
          name="off_home"
          options={{ headerShown: false, title: "Inicio" }}
        /> */}
        <Stack.Screen
          name="offline_clients"
          options={{ headerShown: true, title: "Clientes" }}
        />
        <Stack.Screen
          name="offline_branch_product"
          options={{ headerShown: true, title: "Productos" }}
        />
        <Stack.Screen
          name="offline_make_sales"
          options={{ headerShown: false, title: "Nueva venta" }}
        />
        <Stack.Screen
          name="offline_sales"
          options={{ headerShown: false, title: "Listado de ventas" }}
        />
      </Stack>
    </>
  );
};

export default StackMenu;
