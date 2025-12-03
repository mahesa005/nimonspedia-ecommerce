import { io, Socket } from "socket.io-client";

export const socket: Socket = io("/", {
  path: "/socket.io",
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling']
});

socket.on("connect", () => {
  console.log("Socket Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Socket Connection Error:", err.message);
});