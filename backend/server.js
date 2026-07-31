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








// SEND MESSAGE

socket.on(
"sendMessage",
(message)=>{


if(!message) return;


const receiverSocket =
onlineUsers[message.receiver];



if(receiverSocket){


io.to(receiverSocket)
.emit(
"receiveMessage",
message
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