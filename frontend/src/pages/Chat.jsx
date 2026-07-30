import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";

import socket from "../services/socket";



function Chat(){


const [selectedUser,setSelectedUser] = useState(null);


const [onlineUsers,setOnlineUsers] = useState([]);


const [lastSeen,setLastSeen] = useState({});







useEffect(()=>{


const onlineHandler=(users)=>{


console.log(
"ONLINE USERS",
users
);


setOnlineUsers(users);


};





const lastSeenHandler=(data)=>{


console.log(
"LAST SEEN",
data
);


setLastSeen(data);


};






socket.on(

"onlineUsers",

onlineHandler

);





socket.on(

"lastSeen",

lastSeenHandler

);








return()=>{


socket.off(

"onlineUsers",

onlineHandler

);



socket.off(

"lastSeen",

lastSeenHandler

);



};



},[]);










return (

<div

style={{

display:"flex",

height:"100vh"

}}

>



<Sidebar

setSelectedUser={setSelectedUser}

/>







<ChatBox


selectedUser={selectedUser}


onlineUsers={onlineUsers}


lastSeen={lastSeen}



/>





</div>

);


}


export default Chat;