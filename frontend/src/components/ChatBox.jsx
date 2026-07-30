import {
useEffect,
useRef,
useState
} from "react";

import api from "../services/api";
import socket from "../services/socket";


function ChatBox({
selectedUser,
onlineUsers,
lastSeen
}){


const user =
JSON.parse(
localStorage.getItem("user")
);



const [messages,setMessages]=useState([]);

const [message,setMessage]=useState("");

const [image,setImage]=useState(null);

const [imagePreview,setImagePreview]=useState("");

const [file,setFile]=useState(null);

const [typing,setTyping]=useState(false);



const chatRef=useRef();

const typingTimeout=useRef(null);







// SOCKET CONNECT

useEffect(()=>{


if(user?._id){


socket.connect();


socket.emit(
"addUser",
user._id
);


}



return()=>{

socket.disconnect();

};


},[]);









// LOAD MESSAGES

useEffect(()=>{


if(!selectedUser){

setMessages([]);

return;

}



const loadMessages=async()=>{


try{


const res =
await api.get(
`/messages/${user._id}/${selectedUser._id}`
);



setMessages(
res.data
);




// seen

await api.put(
"/messages/seen",
{
sender:selectedUser._id,
receiver:user._id
}
);



socket.emit(
"messageSeen",
{
sender:selectedUser._id,
receiver:user._id
}
);



}
catch(err){

console.log(err);

}



};



loadMessages();



},[selectedUser]);









// RECEIVE MESSAGE

useEffect(()=>{


const receiveMessage=(data)=>{


if(!data || !selectedUser)
return;



if(

data.sender===selectedUser._id &&

data.receiver===user._id

){



setMessages(prev=>{


const exists =
prev.some(
msg=>msg._id===data._id
);



if(exists)
return prev;



return [

...prev,

data

];


});




// immediately seen

api.put(
"/messages/seen",
{
sender:data.sender,
receiver:user._id
}
);



socket.emit(
"messageSeen",
{
sender:data.sender,
receiver:user._id
}
);



}



};




socket.on(
"receiveMessage",
receiveMessage
);



return()=>{


socket.off(
"receiveMessage",
receiveMessage
);



};


},[selectedUser]);
// BLUE TICK

useEffect(()=>{


const seenHandler=(data)=>{


if(!data)
return;



setMessages(prev=>


prev.map(msg=>{


if(

msg.sender===user._id &&

msg.receiver===data.sender

){


return{

...msg,

seen:true

};


}


return msg;


})

);


};



socket.on(
"messageSeen",
seenHandler
);



return()=>{


socket.off(
"messageSeen",
seenHandler
);



};


},[]);











// TYPING

useEffect(()=>{


const typingHandler=(data)=>{


if(
data?.sender===selectedUser?._id
){

setTyping(true);

}


};



const stopTypingHandler=(data)=>{


if(
data?.sender===selectedUser?._id
){

setTyping(false);

}


};



socket.on(
"typing",
typingHandler
);



socket.on(
"stopTyping",
stopTypingHandler
);



return()=>{


socket.off(
"typing",
typingHandler
);



socket.off(
"stopTyping",
stopTypingHandler
);



};


},[selectedUser]);











// AUTO SCROLL

useEffect(()=>{


if(chatRef.current){


chatRef.current.scrollTop =
chatRef.current.scrollHeight;


}



},[messages]);











// SEND MESSAGE

const sendMessage=async()=>{


try{


let imageUrl="";

let fileUrl="";

let fileName="";





if(image){


const form=new FormData();


form.append(
"image",
image
);



const res =
await api.post(
"/upload/image",
form
);



imageUrl=res.data.url;


}







if(file){


const form=new FormData();


form.append(
"file",
file
);



const res =
await api.post(
"/upload/file",
form
);



fileUrl=res.data.url;

fileName=res.data.fileName;


}






if(

!message.trim()
&&
!imageUrl
&&
!fileUrl

){

return;

}







const msg={


sender:user._id,

receiver:selectedUser._id,

text:message,

image:imageUrl,

file:fileUrl,

fileName:fileName,

seen:false,

createdAt:new Date()

};








const res =
await api.post(
"/messages",
msg
);






setMessages(prev=>[

...prev,

res.data

]);





socket.emit(
"sendMessage",
res.data
);






setMessage("");

setImage(null);

setFile(null);

setImagePreview("");



}
catch(err){

console.log(err);

}



};

return(

<div

style={{

flex:1,

display:"flex",

flexDirection:"column",

height:"100vh"

}}

>


{

!selectedUser

?

<h2>
Select Chat
</h2>


:

<>





{/* HEADER */}

<div

style={{

padding:"12px",

borderBottom:"1px solid #ddd",

display:"flex",

alignItems:"center",

gap:"12px"

}}

>


<img

src={

selectedUser?.avatar

?

`http://localhost:5001${selectedUser.avatar}`

:

"https://via.placeholder.com/50"

}

width="50"

height="50"

style={{

borderRadius:"50%",

objectFit:"cover"

}}

/>



<div>


<h3>

{selectedUser.name}

</h3>



<small>


{

onlineUsers?.includes(selectedUser._id)

?

"🟢 Online"

:

lastSeen?.[selectedUser._id]

?

"Last seen " +

new Date(
lastSeen[selectedUser._id]
).toLocaleString()

:

"Offline"

}


</small>



{

typing &&

<p

style={{

color:"green",

margin:0

}}

>

typing...

</p>

}



</div>


</div>









{/* MESSAGE AREA */}


<div

ref={chatRef}

style={{

flex:1,

overflowY:"auto",

background:"#efeae2",

padding:"15px"

}}

>


{

messages.map((msg,index)=>(


<div

key={msg._id || index}

style={{

textAlign:

msg.sender===user._id

?

"right"

:

"left"

}}

>


<div

style={{

display:"inline-block",

background:

msg.sender===user._id

?

"#d9fdd3"

:

"white",

padding:"10px",

margin:"5px",

borderRadius:"10px",

maxWidth:"70%"

}}

>



{

msg.image &&

<img

src={`http://localhost:5001${msg.image}`}

width="200"

/>

}




{

msg.file &&

<div>

<a

href={`http://localhost:5001${msg.file}`}

target="_blank"

rel="noreferrer"

>

📎 {msg.fileName}

</a>

</div>

}





<p>

{msg.text}

</p>





<div

style={{

fontSize:"11px",

color:"gray"

}}

>


{

new Date(
msg.createdAt
).toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

})

}




{

msg.sender===user._id &&

(

msg.seen

?

<span style={{color:"blue"}}>

✓✓

</span>

:

<span>

✓

</span>

)

}



</div>



</div>



</div>


))

}



</div>









{/* IMAGE PREVIEW */}


{

imagePreview &&

<img

src={imagePreview}

width="80"

/>

}








{

file &&

<p>

📎 {file.name}

</p>

}









{/* INPUT */}


<div

style={{

display:"flex",

gap:"5px",

padding:"10px",

borderTop:"1px solid #ddd"

}}

>




<input

type="file"

accept="image/*"

onChange={(e)=>{


const img=e.target.files[0];


if(img){


setImage(img);


setImagePreview(
URL.createObjectURL(img)
);


}


}}

/>






<input

type="file"

onChange={(e)=>{


setFile(
e.target.files[0]
);


}}

/>







<input

value={message}

onChange={(e)=>{


setMessage(
e.target.value
);



socket.emit(
"typing",
{
receiver:selectedUser._id
}
);



if(typingTimeout.current){

clearTimeout(
typingTimeout.current
);

}



typingTimeout.current=setTimeout(()=>{


socket.emit(
"stopTyping",
{
receiver:selectedUser._id
}
);



},1500);



}}

placeholder="Type message..."

style={{

flex:1,

padding:"10px"

}}

/>








<button

onClick={sendMessage}

>

Send

</button>



</div>





</>


}



</div>


);


}


export default ChatBox;