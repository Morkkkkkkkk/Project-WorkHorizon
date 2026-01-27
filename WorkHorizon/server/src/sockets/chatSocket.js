export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ใช้คำว่า room เพื่อให้สื่อความหมายกลางๆ
    socket.on("join_room", (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on("send_message", (data) => {
      // ✅ แก้ไข: ใช้ data.room ให้ตรงกับที่ Frontend ส่งมา
      // และส่ง data กลับไปทั้งหมด (ซึ่งจะมี content, sender, ฯลฯ)
      io.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};