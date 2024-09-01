import { io } from "socket.io-client";
import { SOCKET } from "../utils/constants";

export const createSocket = () => {
  const socket = io(SOCKET, {
    transports: ["websocket"],
  });

  return socket;
};
