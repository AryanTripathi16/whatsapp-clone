import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import socket from "../services/socket";

function ChatBox({ selectedUser, onlineUsers, lastSeen }) {

  const user = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [file, setFile] = useState(null);

  const [typing, setTyping] = useState(false);

  const chatRef = useRef(null);
  const bottomRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const typingTimeout = useRef(null);


  // ================= LOAD MESSAGES =================

  useEffect(() => {

    if (!selectedUser) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {

      try {

        const res = await api.get(
          `/messages/${user._id}/${selectedUser._id}`
        );

        setMessages(res.data);

        // Seen Update

        await api.put("/messages/seen", {
          sender: selectedUser._id,
          receiver: user._id,
        });

        socket.emit("messageSeen", {
          sender: selectedUser._id,
          receiver: user._id,
        });

      } catch (err) {
        console.log(err);
      }

    };

    loadMessages();

  }, [selectedUser, user]);

    // ================= RECEIVE MESSAGE =================

  useEffect(() => {

    const receiveMessage = async (data) => {

      if (!selectedUser || !data) return;

      if (
        data.sender === selectedUser._id &&
        data.receiver === user._id
      ) {

        setMessages((prev) => {

          const exists = prev.find(
            (msg) => msg._id === data._id
          );

          if (exists) return prev;

          return [...prev, data];

        });

        try {

          await api.put("/messages/seen", {
            sender: data.sender,
            receiver: user._id,
          });

          socket.emit("messageSeen", {
            sender: data.sender,
            receiver: user._id,
          });

        } catch (err) {
          console.log(err);
        }

      }

    };

    socket.on("receiveMessage", receiveMessage);

    return () => {

      socket.off("receiveMessage", receiveMessage);

    };

  }, [selectedUser, user]);



  // ================= MESSAGE SEEN =================

  useEffect(() => {

    const seenHandler = (data) => {

      if (!data) return;

      setMessages((prev) =>
        prev.map((msg) => {

          if (
            msg.sender === user._id &&
            msg.receiver === data.sender
          ) {
            return {
              ...msg,
              seen: true,
            };
          }

          return msg;

        })
      );

    };

    socket.on("messageSeen", seenHandler);

    return () => {

      socket.off("messageSeen", seenHandler);

    };

  }, [user]);



  // ================= TYPING =================

  useEffect(() => {

    const typingHandler = (data) => {

      if (
        selectedUser &&
        data.sender === selectedUser._id
      ) {
        setTyping(true);
      }

    };

    const stopTypingHandler = (data) => {

      if (
        selectedUser &&
        data.sender === selectedUser._id
      ) {
        setTyping(false);
      }

    };

    socket.on("typing", typingHandler);

    socket.on("stopTyping", stopTypingHandler);

    return () => {

      socket.off("typing", typingHandler);

      socket.off("stopTyping", stopTypingHandler);

    };

  }, [selectedUser]);



  // ================= AUTO SCROLL =================

useEffect(()=>{

if(autoScroll){

bottomRef.current?.scrollIntoView({
behavior:"smooth"
});

}

},[messages]);

// ================= SEND MESSAGE =================

const sendMessage = async () => {

  if (!selectedUser) return;

  try {

    let imageUrl = "";
    let fileUrl = "";
    let fileName = "";

    // Upload Image

    if (image) {

      const form = new FormData();
      form.append("image", image);

      const res = await api.post(
        "/upload/image",
        form
      );

      imageUrl = res.data.url;

    }

    // Upload File

    if (file) {

      const form = new FormData();
      form.append("file", file);

      const res = await api.post(
        "/upload/file",
        form
      );

      fileUrl = res.data.url;
      fileName = res.data.fileName;

    }

    // Empty Check

    if (
      message.trim() === "" &&
      imageUrl === "" &&
      fileUrl === ""
    ) {
      return;
    }

    const newMessage = {

      sender: user._id,

      receiver: selectedUser._id,

      text: message,

      image: imageUrl,

      file: fileUrl,

      fileName: fileName,

      seen: false,

      createdAt: new Date()

    };

    // Save Database

    const res = await api.post(
      "/messages",
      newMessage
    );

    // Add Message Locally

    setMessages((prev)=>{

    const already = prev.find(
    m=>m._id === res.data._id
    );

    if(already){
    return prev;
    }

    return [
    ...prev,
    res.data
    ];

    });

    // Send Socket Event

    socket.emit(
      "sendMessage",
      res.data
    );

    // Stop Typing

    socket.emit(
      "stopTyping",
      {

        sender: user._id,

        receiver: selectedUser._id

      }
    );

    // Clear Input

    setMessage("");

    setImage(null);

    setImagePreview("");

    setFile(null);

  }

  catch (err) {

    console.log(err);

  }

};

return (

<div
style={{
flex:1,
display:"flex",
flexDirection:"column",
height:"100vh",
background:"#ece5dd"
}}
>

{

!selectedUser

?

<div
style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
height:"100%"
}}
>

<h2>Select Chat</h2>

</div>

:

<>

{/* ================= HEADER ================= */}

<div
style={{
height:"70px",
background:"#f0f2f5",
display:"flex",
alignItems:"center",
padding:"10px 20px",
borderBottom:"1px solid #ddd"
}}
>

<img

src={
selectedUser.avatar
?
`http://localhost:5001${selectedUser.avatar}`
:
"https://via.placeholder.com/50"
}

alt="avatar"

style={{
width:"50px",
height:"50px",
borderRadius:"50%",
objectFit:"cover",
marginRight:"15px"
}}

/>

<div>

<h3
style={{
margin:0
}}
>

{selectedUser.name}

</h3>

<small>

{

onlineUsers.includes(selectedUser._id)

?

"🟢 Online"

:

lastSeen[selectedUser._id]

?

`Last Seen ${new Date(
lastSeen[selectedUser._id]
).toLocaleString()}`

:

"Offline"

}

</small>

{

typing &&

<p
style={{
margin:0,
color:"green"
}}
>

Typing...

</p>

}

</div>

</div>

{/* ================= CHAT AREA ================= */}

<div

ref={chatRef}

onScroll={()=>{

const box = chatRef.current;

if(box.scrollTop + box.clientHeight < box.scrollHeight - 50){

setAutoScroll(false);

}
else{

setAutoScroll(true);

}

}}

style={{
flex:1,
overflowY:"auto",
padding:"20px",
background:"#efeae2"
}}

>

{

messages.map((msg,index)=>(

<div

key={msg._id || index}

style={{

display:"flex",

justifyContent:

msg.sender===user._id

?

"flex-end"

:

"flex-start",

marginBottom:"12px"

}}

>
<div ref={bottomRef}></div>
<div

style={{

background:

msg.sender===user._id

?

"#d9fdd3"

:

"#fff",

padding:"10px",

borderRadius:"12px",

maxWidth:"60%",

boxShadow:"0 1px 3px rgba(0,0,0,.15)"

}}

>


{

msg.image &&

<img

src={`http://localhost:5001${msg.image}`}

style={{

width:"220px",

borderRadius:"10px",

marginBottom:"10px"

}}

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

textAlign:"right",

color:"gray"

}}

>

{

new Date(msg.createdAt)

.toLocaleTimeString([],

{

hour:"2-digit",

minute:"2-digit"

})

}

{

msg.sender===user._id

&&

(

msg.seen

?

<span
style={{
color:"blue",
marginLeft:"5px"
}}
>

✓✓

</span>

:

<span
style={{
marginLeft:"5px"
}}
>

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

{/* ================= IMAGE PREVIEW ================= */}

{
imagePreview && (

<div
style={{
padding:"10px",
background:"#f5f5f5"
}}
>

<img
src={imagePreview}
alt="preview"
style={{
width:"100px",
borderRadius:"10px"
}}
/>

</div>

)
}

{/* ================= FILE PREVIEW ================= */}

{
file && (

<div
style={{
paddingLeft:"10px",
paddingBottom:"5px"
}}
>

📎 {file.name}

</div>

)
}

{/* ================= INPUT AREA ================= */}

<div

style={{

display:"flex",

alignItems:"center",

gap:"10px",

padding:"10px",

background:"#f0f2f5",

borderTop:"1px solid #ddd"

}}

>

{/* IMAGE */}

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

{/* FILE */}

<input

type="file"

onChange={(e)=>{

const f=e.target.files[0];

if(f){

setFile(f);

}

}}

/>

{/* MESSAGE */}

<input

type="text"

value={message}

disabled={!selectedUser}

placeholder="Type a message"

style={{

flex:1,

padding:"12px",

borderRadius:"20px",

border:"1px solid #ccc",

outline:"none"

}}

onChange={(e)=>{

setMessage(e.target.value);

if(!selectedUser) return;

socket.emit("typing",{

sender:user._id,

receiver:selectedUser._id

});

if(typingTimeout.current){

clearTimeout(
typingTimeout.current
);

}

typingTimeout.current=setTimeout(()=>{

socket.emit("stopTyping",{

sender:user._id,

receiver:selectedUser._id

});

},1500);

}}

onKeyDown={(e)=>{

if(e.key==="Enter"){

sendMessage();

}

}}

/>

{/* SEND */}

<button

disabled={!selectedUser}

onClick={sendMessage}

style={{

padding:"12px 18px",

background:"#25D366",

color:"white",

border:"none",

borderRadius:"10px",

cursor:"pointer"

}}

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