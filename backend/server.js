import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";


import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import messageRoutes from "./routes/messages.js";
import uploadRoutes from "./routes/upload.js";
import Message from "./models/Message.js";


dotenv.config();


const app = express();


// middleware

app.use(
cors({
    origin:"http://localhost:5173",
    credentials:true
})
);


app.use(express.json());


app.use(
"/uploads",
express.static("uploads")
);




// DATABASE

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("MongoDB Connected");
})
.catch(err=>{
    console.log("Mongo Error:",err.message);
});





// ROUTES

app.use("/api/auth",authRoutes);

app.use("/api/users",userRoutes);

app.use("/api/messages",messageRoutes);

app.use("/api/upload",uploadRoutes);






// HTTP SERVER

const server=http.createServer(app);






// SOCKET SERVER

const io=new Server(server,{

cors:{
    origin:"http://localhost:5173",
    credentials:true
}

});






// USERS STORAGE

let onlineUsers={};

let lastSeen={};







io.on("connection",(socket)=>{


console.log(
"Socket connected:",
socket.id
);




// ADD USER

socket.on(
"addUser",
(userId)=>{


if(!userId) return;


onlineUsers[userId]=socket.id;


delete lastSeen[userId];



io.emit(
"onlineUsers",
Object.keys(onlineUsers)
);


io.emit(
"lastSeen",
lastSeen
);



});


// MESSAGE REACTION


socket.on("messageReaction", (data) => {

    socket.broadcast.emit(
        "messageReaction",
        data
    );

});







// SEND MESSAGE

socket.on(
"sendMessage",
async (message)=>{


if(!message) return;


const receiverSocket =
onlineUsers[message.receiver];



if(receiverSocket){

    await Message.findByIdAndUpdate(
  message._id,
  {
    status: "delivered",
  }
);


io.to(receiverSocket)
.emit(
"receiveMessage",
message
);

io.to(socket.id).emit(
  "messageDelivered",
  {
    messageId: message._id,
  }
);


}



});









// MESSAGE SEEN

socket.on(
"messageSeen",
(data)=>{


if(!data) return;



const senderSocket =
onlineUsers[data.sender];



if(senderSocket){


io.to(senderSocket)
.emit(
"messageSeen",
{

sender:data.sender,

receiver:data.receiver

}
);


}



});






// DELETE MESSAGE

socket.on(
"deleteMessage",
(data)=>{

if(!data) return;


const receiverSocket =
onlineUsers[data.receiver];


if(receiverSocket){

io.to(receiverSocket)
.emit(
"messageDeleted",
{
messageId:data.messageId
}
);

}


});





// TYPING

socket.on(
"typing",
(data)=>{

if(!data) return;


const receiverSocket =
onlineUsers[data.receiver];


if(receiverSocket){

io.to(receiverSocket)
.emit(
"typing",
{
sender:data.sender
}
);

}


});








// STOP TYPING


socket.on(
"stopTyping",
(data)=>{


if(!data) return;


const receiverSocket =
onlineUsers[data.receiver];


if(receiverSocket){

io.to(receiverSocket)
.emit(
"stopTyping",
{
sender:data.sender
}
);

}


});



// ================= CALL USER =================

socket.on("callUser", (data) => {

  const receiverSocket = onlineUsers[data.receiver];

  if (receiverSocket) {

    io.to(receiverSocket).emit("incomingCall", {
      caller: data.caller,
      type: data.type,
      signal: data.signal
    });

  }

});

// ================= ACCEPT CALL =================

socket.on("acceptCall", (data) => {

  const callerSocket = onlineUsers[data.caller];

  if (callerSocket) {

    io.to(callerSocket).emit("callAccepted", data.signal);

  }

});

// ================= REJECT CALL =================

socket.on("rejectCall", (data) => {

  console.log("CALL REJECT REQUEST:", data);

  const callerSocket = onlineUsers[data.caller];

  if (callerSocket) {

    io.to(callerSocket).emit("callRejected", {
      message:"User rejected call"
    });

  }

});

// ================= END CALL =================

socket.on("endCall", (data) => {

  const receiverSocket = onlineUsers[data.receiver];

  if (receiverSocket) {
    io.to(receiverSocket).emit("callEnded");
  }

});








// DISCONNECT

socket.on(
"disconnect",
()=>{


let userId=null;



for(
let id in onlineUsers
){


if(
onlineUsers[id]===socket.id
){


userId=id;


delete onlineUsers[id];


lastSeen[id]=
new Date().toISOString();


break;

}


}





io.emit(
"onlineUsers",
Object.keys(onlineUsers)
);


io.emit(
"lastSeen",
lastSeen
);



console.log(
"Disconnected:",
socket.id
);



});






});






server.listen(
5001,
()=>{

console.log(
"Server running at 5001"
);

}
);