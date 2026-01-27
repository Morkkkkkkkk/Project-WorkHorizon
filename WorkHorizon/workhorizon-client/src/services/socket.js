import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // URL ของ Backend คุณ
export const socket = io(SOCKET_URL, {
  autoConnect: false, // ให้เชื่อมต่อเมื่อต้องการเท่านั้น เช่น หลัง Login
});