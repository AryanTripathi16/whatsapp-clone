let onlineUsers = [];

const socketHandler = (io) => {

    io.on("connection", (socket) => {

        console.log("✅ User Connected:", socket.id);


        // Join Room
        socket.on("joinRoom", (userId) => {

            socket.userId = userId;

            socket.join(userId);

            if (!onlineUsers.includes(userId)) {
                onlineUsers.push(userId);
            }

            io.emit("onlineUsers", onlineUsers);

            console.log("Online Users:", onlineUsers);

        });


        // Send Message
        socket.on("sendMessage", (data) => {

            io.to(data.receiver).emit("receiveMessage", data);

        });

        


// ================= VIDEO CALL =================

socket.on("callUser", (data) => {

    console.log("📞 Incoming Call:", data);

    io.to(data.receiver).emit("incomingCall", {
        caller: data.caller,
        signal: data.signal,
        type: data.type
    });

});


socket.on("acceptCall", (data) => {

    console.log("✅ Call Accepted:", data);

    io.to(data.caller).emit("callAccepted", data.signal);

});


socket.on("rejectCall", (data) => {

    io.to(data.caller).emit("callRejected");

});


socket.on("endCall", (data) => {

    io.to(data.receiver).emit("callEnded");

});


        // Typing
        socket.on("typing", (data) => {

            io.to(data.receiver).emit("userTyping", data);

        });


        // Stop Typing
        socket.on("stopTyping", (data) => {

            io.to(data.receiver).emit("userStopTyping", data);

        });


        // Disconnect
        socket.on("disconnect", () => {

            if (socket.userId) {

                onlineUsers = onlineUsers.filter(
                    (id) => id !== socket.userId
                );

                io.emit("onlineUsers", onlineUsers);

            }

            console.log("❌ User Disconnected:", socket.id);

        });

    });

};

module.exports = socketHandler;