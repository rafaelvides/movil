import customer from "@/app/customer";
import { ThemeContext } from "@/hooks/useTheme";
import { useBillingStore } from "@/store/billing/billing.store";
import { useCustomerStore } from "@/store/customer.store";
import {
  CustomerDirection,
  IPayloadCustomer,
} from "@/types/customer/customer.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useContext, useEffect, useState } from "react";
import { View, Text } from "react-native";

interface Props {
  closeModal: () => void;
  customer?: IPayloadCustomer;
  customer_direction?: CustomerDirection;
  id: number;
}

export const DetailsCustomerNormal = (props: Props) => {
  const [showModal, setShowModal] = useState(false);
  const { theme } = useContext(ThemeContext);
  const [category, setCategory] = useState("")
const {OnGetCat022TipoDeDocumentoDeIde,cat_022_tipo_de_documento_de_ide}=useBillingStore()

useEffect(()=>{
    OnGetCat022TipoDeDocumentoDeIde()
},[])

const categoryDocument = async ()=>{
  if(props.customer?.tipoDocumento){
      await cat_022_tipo_de_documento_de_ide.map((data)=>{
          if(props.customer?.tipoDocumento){
            if(props.customer.tipoDocumento === data.codigo){
              setCategory(data.valores)
            }
          }
      })
  }
}

useEffect(()=>{
    categoryDocument()
},[props.customer?.tipoDocumento, category])

  return (
    <>
      <StatusBar style="dark" />
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.dark,
        }}
      >
       

        <View
          style={{
            flexDirection: "row",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color: "white",
              justifyContent: "center",
              marginTop: 18,
              padding: 20,
            }}
          >
            Detalles cliente normal
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "white",
            borderWidth: 1,
            borderTopRightRadius: 30,
            borderTopLeftRadius:30,
            borderColor: "#fff",
            height: "100%",
            width: "100%",
            borderEndEndRadius:0,
            borderEndStartRadius:0
          }}
        >
          {/* <View style={{
                backgroundColor:"#fff",
                borderWidth:1,
                marginTop:20,
                height:"20%",
                marginLeft:20,
                borderColor:"green",
            // opacity:0.08,
                width:"50%", borderRadius:30
            }}> */}
          <View
            style={{
              marginTop: 40,
              marginLeft: 30,
              flexDirection: "row",
            }}
          >
            <MaterialCommunityIcons
              name="account"
              color={theme.colors.secondary}
              size={30}
              style={{
                position: "absolute",
                marginRight: 60,
                top: "30%",
                transform: [{ translateY: -15 }],
              }}
            />
            <Text
              style={{
                marginLeft: 50,
                color: "black",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {props.customer?.nombre}
            </Text>
          </View>

          <View
            style={{
              marginTop: 40,
              marginLeft: 30,
              flexDirection: "row",
            }}
          >
            <MaterialCommunityIcons
              name="email-outline"
              color={theme.colors.secondary}
              size={30}
              style={{
                position: "absolute",
                marginRight: 60,
                top: "30%",
                transform: [{ translateY: -15 }],
              }}
            />
            <Text
              style={{
                marginLeft: 50,
                color: "black",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {props.customer?.correo}
            </Text>
          </View>

          <View
            style={{
              marginTop: 40,
              marginLeft: 30,
              flexDirection: "row",
            }}
          >
            <MaterialCommunityIcons
              name="phone"
              color={theme.colors.secondary}
              size={30}
              style={{
                position: "absolute",
                marginRight: 60,
                top: "30%",
                transform: [{ translateY: -15 }],
              }}
            />
            <Text
              style={{
                marginLeft: 50,
                color: "black",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {props.customer?.telefono}
            </Text>
          </View>
          <View
            style={{
              marginTop: 40,
              marginLeft: 30,
              flexDirection: "row",
            }}
          >
            <MaterialCommunityIcons
              name="card-text"
              color={theme.colors.secondary}
              size={30}
              style={{
                position: "absolute",
                marginRight: 60,
                top: "30%",
                transform: [{ translateY: -15 }],
              }}
            />
            <Text
              style={{
                marginLeft: 50,
                color: "black",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {category}
            </Text>
          </View>
          <View
            style={{
              marginTop: 40,
              marginLeft: 30,
              flexDirection: "row",
            }}
          >
            <MaterialCommunityIcons
              name="checkbook"
              color={theme.colors.secondary}
              size={30}
              style={{
                position: "absolute",
                marginRight: 60,
                top: "30%",
                transform: [{ translateY: -15 }],
              }}
            />
            <Text
              style={{
                marginLeft: 50,
                color: "black",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {props.customer?.numDocumento}
            </Text>
          </View>
          <View
            style={{
              marginTop: 40,
              marginLeft: 30,
              flexDirection: "row",
            }}
          >
            <MaterialCommunityIcons
              name="card-bulleted-outline"
              color={theme.colors.secondary}
              size={30}
              style={{
                position: "absolute",
                marginRight: 60,
                top: "30%",
                transform: [{ translateY: -15 }],
              }}
            />
            <Text
              style={{
                marginLeft: 50,
                color: "black",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {props.customer_direction?.nombreDepartamento}
            </Text>
          </View>
          <View
            style={{
              marginTop: 40,
              marginLeft: 30,
              flexDirection: "row",
            }}
          >
            <MaterialCommunityIcons
              name="bank"
              color={theme.colors.secondary}
              size={30}
              style={{
                position: "absolute",
                marginRight: 60,
                top: "30%",
                transform: [{ translateY: -15 }],
              }}
            />
            <Text
              style={{
                marginLeft: 50,
                color: "black",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {props.customer_direction?.nombreMunicipio}
            </Text>
          </View>
          <View
            style={{
              marginTop: 40,
              marginLeft: 30,
              flexDirection: "row",
            }}
          >
            <MaterialCommunityIcons
              name="clipboard-outline"
              color={theme.colors.secondary}
              size={30}
              style={{
                position: "absolute",
                marginRight: 60,
                top: "30%",
                transform: [{ translateY: -15 }],
              }}
            />
            <Text
              style={{
                marginLeft: 50,
                color: "black",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {props.customer_direction?.complemento}
            </Text>
          </View>

          {/* </View> */}
        </View>
      </View>
    </>
  );
};
