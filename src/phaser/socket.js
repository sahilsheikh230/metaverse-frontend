import { io } from "socket.io-client";

 export const socket = io("https://metaverse-backend-vfl9.onrender.com/");

socket.on("connect", () => {
  console.log("Connected client side:", socket.id);
})