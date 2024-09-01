import { ToastAndroid } from "react-native";
import { connection } from "../db.config";
import { IClientePayload } from "../dto/customer.dto";
import { Customer } from "../entity/customer.entity";
import { IGetClientsOfflinePaginated } from "../types/customer_offline.types";
import { Like } from "typeorm/browser";

export async function save_client(client: IClientePayload): Promise<boolean> {
  try {
    const clientRepository = connection.getRepository(Customer);
    const existingClient = await clientRepository.findOne({
      where: {
        customerId: client.clienteId,
        numDocumento: client.numDocumento,
      },
    });
    if (existingClient) {
      existingClient.numDocumento = client.numDocumento;
      existingClient.telefono = client.telefono;
      existingClient.correo = client.correo;
      existingClient.municipio = String(client.municipio);
      existingClient.departamento = String(client.departamento);
      existingClient.nombreMunicipio = client.nombreMunicipio;
      existingClient.nombreDepartamento = String(client.nombreDepartamento);
      existingClient.complemento = String(client.complemento);
      existingClient.esContribuyente = client.esContribuyente!;
      existingClient.tipoContribuyente = String(client.tipoContribuyente);
      existingClient.codActividad = String(client.codActividad);
      existingClient.descActividad = String(client.descActividad);

      const save_client = await clientRepository.save(existingClient);
      if (save_client) {
        return true;
      } else {
        return false;
      }
    } else {
      const save_client = await clientRepository.save(client);
      if (save_client) {
        return true;
      } else {
        return false;
      }
    }
  } catch (error) {
    ToastAndroid.show("Error al guardar el cliente", ToastAndroid.SHORT);
    return false;
  }
}

export async function get_clients(): Promise<Customer[]> {
  const clientRepository = connection.getRepository(Customer);

  const clients = await clientRepository.find();

  return clients;
}
export async function getClientsPaginated(
  nombre: string,
  esContribuyente: boolean,
  numDocumento: string,
  page: number,
  limit: number
): Promise<IGetClientsOfflinePaginated> {
  const clientRepository = connection.getRepository(Customer);
  const [clients, total] = await clientRepository.findAndCount({
    where: {
      nombre: nombre ? Like(`%${nombre}%`) : undefined,
      esContribuyente: esContribuyente,
      numDocumento: numDocumento ? Like(`%${numDocumento}%`) : undefined,
    },
    take: limit,
    skip: (page - 1) * limit,
  });
  if (clients.length === 0) {
    return {
      clients: [],
      totalPages: 0,
      totalItems: 0,
      nextPage: 0,
      prevPage: 0,
      currentPage: 0,
      limit: 0,
    };
  }
  let totalPag: number = total / limit;
  if (totalPag % 1 !== 0) {
    totalPag = Math.floor(totalPag) + 1;
  }
  const nextPage: number = page >= totalPag ? page : Number(page) + 1;
  const prevPage: number = page <= 1 ? page : Number(page) - 1;
  return {
    clients: clients,
    totalPages: totalPag,
    totalItems: total,
    nextPage: nextPage,
    prevPage: prevPage,
    currentPage: page,
    limit: limit,
  };
}
export async function get_client_by_id() {
  const clientRepository = connection.getRepository(Customer);
  clientRepository.clear();
}
