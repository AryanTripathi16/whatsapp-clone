import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./Chat.css";


const socket = io("http://localhost:8000");


function Chat(){


const [users,setUsers] = useState([]);

const [selectedUser,setSelectedUser] = useState(null);

const [messages,setMessages] = useState([]);

const [text,setText] = useState("");

const [onlineUsers,setOnlineUsers] = useState([]);

const [typingUser,setTypingUser] = useState(null);


const chatBox = useRef();


const user = JSON.parse(
    localStorage.getItem("user")
);







useEffect(()=>{


if(user?._id){

socket.emit(
"joinRoom",
user._id
);

}






socket.on(
"receiveMessage",
(data)=>{


setMessages((prev)=>[

...prev,

data

]);



// delivered

socket.emit(
"messageDelivered",
{

id:data._id,

sender:data.sender

}

);



});








socket.on(
"updateStatus",
(data)=>{


setMessages((prev)=>


prev.map((msg)=>

msg._id === data.id

?

{

...msg,

status:data.status

}

:

msg


)


);


});








socket.on(
"onlineUsers",
(data)=>{


setOnlineUsers(data);


});








socket.on(
"userTyping",
(data)=>{


if(data.sender !== user._id){

setTypingUser(data.sender);

}


});








socket.on(
"userStopTyping",
(data)=>{


if(data.sender !== user._id){

setTypingUser(null);

}


});






return ()=>{


socket.off("receiveMessage");

socket.off("updateStatus");

socket.off("onlineUsers");

socket.off("userTyping");

socket.off("userStopTyping");


};


},[]);










const getUsers = async()=>{


const res = await axios.get(

"http://localhost:8000/api/users"

);


setUsers(res.data);


};










const getMessages = async(id)=>{


const res = await axios.get(

`http://localhost:8000/api/messages/${user._id}/${id}`

);


setMessages(res.data);


};










const selectUser=(person)=>{


setSelectedUser(person);


getMessages(person._id);


};










const sendMessage = async()=>{


if(!text.trim()) return;


const data={


sender:user._id,

receiver:selectedUser._id,

message:text,

status:"sent",

createdAt:new Date()


};




try{


const res = await axios.post(

"http://localhost:8000/api/messages",

data

);



socket.emit(

"sendMessage",

res.data

);



setMessages((prev)=>[

...prev,

res.data

]);



setText("");


}

catch(error){

console.log(error);

}


};









const typingHandler=(e)=>{


setText(e.target.value);



if(selectedUser){


socket.emit(

"typing",

{

sender:user._id,

receiver:selectedUser._id

}

);



setTimeout(()=>{


socket.emit(

"stopTyping",

{

sender:user._id,

receiver:selectedUser._id

}

);


},1000);


}



};










const markSeen=()=>{


messages.forEach((msg)=>{


if(

msg.sender === selectedUser?._id &&

msg.status !== "seen"

){



socket.emit(

"messageSeen",

{

id:msg._id,

sender:msg.sender

}

);



axios.put(

`http://localhost:8000/api/messages/status/${msg._id}`,

{

status:"seen"

}

);



}



});


};









useEffect(()=>{

getUsers();

},[]);






useEffect(()=>{


chatBox.current?.scrollTo({

top:chatBox.current.scrollHeight,

behavior:"smooth"

});


},[messages]);








const logout=()=>{

localStorage.clear();

window.location.href="/login";

};








return(

<div className="chat-container">



<div className="sidebar">


<div className="profile">

<h2>{user.name}</h2>

<button onClick={logout}>
Logout
</button>


</div>



<h3>Users</h3>



{

users.map((person)=>(


<div

className="user"

key={person._id}

onClick={()=>selectUser(person)}

>


<h4>

{person.name}


{

onlineUsers.includes(person._id)

?

<span style={{color:"green"}}>
 🟢 Online
</span>

:

<span style={{color:"gray"}}>
 ⚪ Offline
</span>


}


</h4>


<p>{person.email}</p>


</div>


))

}


</div>








<div className="chat-section">


{

selectedUser ?


<>


<div className="chat-header">


<h2>
{selectedUser.name}
</h2>



{

typingUser === selectedUser._id &&

<p style={{color:"green"}}>
typing...
</p>

}


</div>







<div

className="messages"

ref={chatBox}

onClick={markSeen}

>


{

messages.map((msg,index)=>(


<div

key={index}

className={

msg.sender===user._id

?

"my-message"

:

"other-message"

}

>


<p>

{msg.message}

</p>



<span>


{

new Date(

msg.createdAt

).toLocaleTimeString()

}



{


msg.sender===user._id &&


(

msg.status==="seen"

?

<span style={{color:"blue"}}>
 ✓✓
</span>


:

msg.status==="delivered"

?

<span>
 ✓✓
</span>


:

<span>
 ✓
</span>


)


}



</span>



</div>


))


}



</div>









<div className="input-box">


<input

value={text}

onChange={typingHandler}

placeholder="Type message..."

onKeyDown={(e)=>{

if(e.key==="Enter"){

sendMessage();

}

}}

/>



<button onClick={sendMessage}>

Send

</button>


</div>




</>


:


<h2>
Select User
</h2>


}



</div>


</div>

);


}


export default Chat;