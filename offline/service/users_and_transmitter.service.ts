import { ToastAndroid } from "react-native";
import { connection } from "../db.config";
import { IUserAndTransmitter } from "../types/user_and_transmitter.types";
import { User } from "../entity/user.entity";
import { Transmitter } from "../entity/transmitter.entity";
import { ICreateEmisor } from "../types/transmitter_offline.types";
export async function saveUserAndTransmitter(
  data: IUserAndTransmitter,
  transmitter: ICreateEmisor,
  password: string
) {
  try {
    const userRepository = connection.getRepository(User);
    const transmitterRepository = connection.getRepository(Transmitter);

    const existingUser = await userRepository.findOne({
      where: {
        userId: data.user.id,
      },
    });
    const existingTransmitter = await transmitterRepository.findOne({
      where: {
        nit: transmitter.nit,
      },
    });
    if (existingUser) {
      if (existingTransmitter) {
        existingTransmitter.clavePrivada = transmitter.clavePrivada;
        existingTransmitter.clavePublica = transmitter.clavePublica;
        existingTransmitter.correo = transmitter.correo;
        existingTransmitter.nombreComercial = transmitter.nombreComercial;
        existingTransmitter.telefono = transmitter.telefono;
        existingTransmitter.departamento = transmitter.departamento;
        existingTransmitter.municipio = transmitter.municipio;

        const savedExistingTransmitter = await transmitterRepository.save(
          existingTransmitter
        );

        existingUser.rolId = data.user.roleId;
        existingUser.rolName = data.user.role.name;
        existingUser.userId = data.user.id;
        existingUser.username = data.user.userName;
        existingUser.password = password;
        existingUser.token = data.token;
        existingUser.transmitterId = savedExistingTransmitter.id;
        existingUser.transmitter = savedExistingTransmitter;
        existingUser.BoxId = data.box && data.box.id ? data.box.id : 0;

        const savedExistingUser = await userRepository.save(existingUser);
        return savedExistingUser;
      } else {
        const newTransmitter = transmitterRepository.create(transmitter);
        existingUser.rolId = data.user.roleId;
        existingUser.rolName = data.user.role.name;
        existingUser.userId = data.user.id;
        existingUser.username = data.user.userName;
        existingUser.password = password;
        existingUser.token = data.token;
        existingUser.transmitterId = newTransmitter.id;
        existingUser.transmitter = newTransmitter;
        existingUser.BoxId = data.box && data.box.id ? data.box.id : 0;

        const savedExistingUser = await transmitterRepository.save(
          existingUser
        );
        return savedExistingUser;
      }
    } else if (existingTransmitter) {
      const newUser = userRepository.save({
        userId: data.user.id,
        username: data.user.userName,
        password: password,
        token: data.token,
        rolId: data.user.roleId,
        rolName: data.user.role.name,
        emisorId: existingTransmitter?.id,
        emisor: existingTransmitter!,
        BoxId: data.box && data.box.id ? data.box.id : 0,
      });

      return newUser;
    }
    const newTransmitter = await transmitterRepository.save(transmitter);
    const newUser = await userRepository.save({
      userId: data.user.id,
      username: data.user.userName,
      password: password,
      rolId: data.user.roleId,
      rolName: data.user.role.name,
      emisorId: newTransmitter.id,
      emisor: newTransmitter,
      BoxId: data.box && data.box.id ? data.box.id : 0,
    });
    return newUser;
  } catch (error) {
    ToastAndroid.show(`Error ${error}`, ToastAndroid.LONG);
  }
}
export const getUserLocaL = async (name: string) => {
  try {
    const userRepository = connection.getRepository(User);

    const existingUser = await userRepository.findOne({
      where: {
        username: name,
      },
      relations: {
        transmitter: true,
      },
    });
    if (existingUser) {
      return existingUser;
    } else {
      ToastAndroid.show("Usuario no encontrado", ToastAndroid.LONG);
    }
  } catch (error) {
    ToastAndroid.show("Error al obtener usuario", ToastAndroid.LONG);
  }
};
export const getEmisorLocal = async (id: number) => {
  try {
    const emisorRepository = connection.getRepository(Transmitter);
    const existingEmisor = await emisorRepository.findOne({
      where: {
        transmitterId: id,
      },
    });
    if (existingEmisor) {
      return existingEmisor;
    } else {
      ToastAndroid.show("Emisor no encontrado", ToastAndroid.LONG);
    }
  } catch (error) {
    ToastAndroid.show("Error al obtener emisor", ToastAndroid.LONG);
  }
};
export const login_offline = async (userName: string, password: string) => {
  try {
    const userRepository = connection.getRepository(User);

    const existingUser = await userRepository.findOne({
      where: {
        username: userName,
      },
    });
    if (existingUser && existingUser.password === password) {
      return {
        token: existingUser.token,
        user: existingUser,
      };
    } else {
      return {
        token: "",
        user: null,
      };
    }
  } catch (error) {
    ToastAndroid.show("Ocurrió un error inesperado", ToastAndroid.LONG);
    return {
      token: "",
      user: null,
    };
  }
};
