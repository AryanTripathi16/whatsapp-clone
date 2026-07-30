import { useEffect, useState } from "react";

import api from "../services/api";
import socket from "../services/socket";
import UserCard from "./UserCard";


function Sidebar({setSelectedUser}){


const [users,setUsers]=useState([]);

const [onlineUsers,setOnlineUsers]=useState([]);

const [lastMessages,setLastMessages]=useState({});

const [unread,setUnread]=useState({});



const currentUser = JSON.parse(
localStorage.getItem("user")
);






useEffect(()=>{


const getUsers=async()=>{


try{


const res = await api.get("/users");


setUsers(

res.data.filter(

u=>u._id!==currentUser._id

)

);


}
catch(error){

console.log(error);

}


};



getUsers();







// Online Users

const onlineHandler=(data)=>{


setOnlineUsers(data);


};



socket.on(

"onlineUsers",

onlineHandler

);









// Receive Message

const messageHandler=(data)=>{


setLastMessages(prev=>({

...prev,

[data.sender]:data

}));



setUnread(prev=>({


...prev,


[data.sender]: (prev[data.sender] || 0) + 1


}));



};



socket.on(

"receiveMessage",

messageHandler

);










// Sender last message update

const lastMessageHandler=(data)=>{


setLastMessages(prev=>({


...prev,


[data.sender]:data


}));


};



socket.on(

"lastMessage",

lastMessageHandler

);









return()=>{


socket.off(

"onlineUsers",

onlineHandler

);


socket.off(

"receiveMessage",

messageHandler

);


socket.off(

"lastMessage",

lastMessageHandler

);



};



},[]);









const selectUser=(user)=>{


setSelectedUser(user);



setUnread(prev=>({

...prev,

[user._id]:0

}));



};









return (

<div

style={{

width:"300px",

borderRight:"1px solid #ddd",

overflowY:"auto"

}}

>


<h3

style={{

padding:"15px"

}}

>

Chats

</h3>







{

users.map(user=>(


<div key={user._id}>


<UserCard

user={user}

setSelectedUser={selectUser}

onlineUsers={onlineUsers}

/>







{

lastMessages[user._id] &&

<div

style={{

paddingLeft:"15px",

paddingBottom:"10px",

fontSize:"13px",

color:"gray"

}}

>


<span>

{

lastMessages[user._id].text

?

lastMessages[user._id].text.slice(0,25)

:

"📎 Media"

}

</span>





<span

style={{

marginLeft:"10px"

}}

>

{

new Date(

lastMessages[user._id].createdAt

).toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

})

}

</span>







{

unread[user._id] > 0 &&

<span

style={{

marginLeft:"10px",

background:"green",

color:"white",

borderRadius:"50%",

padding:"3px 7px"

}}

>

{unread[user._id]}

</span>

}





</div>


}



</div>


))

}





</div>


);


}


export default Sidebar;