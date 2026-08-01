import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import socket from "../services/socket";
import EmojiPicker from "emoji-picker-react";
import {
  FiPhone,
  FiVideo,
  FiSearch,
  FiMoreVertical
} from "react-icons/fi";
 import Peer from "simple-peer";

function ChatBox({ selectedUser, onlineUsers, lastSeen }) {

  const [user] = useState(
  JSON.parse(localStorage.getItem("user"))
);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState(null);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [file, setFile] = useState(null);

  const [showEmoji, setShowEmoji] = useState(false);

  const [typing, setTyping] = useState(false);

  const [showMenu, setShowMenu] = useState(false);

const [callType, setCallType] = useState(null);
const [caller, setCaller] = useState(null);
const [callerSignal, setCallerSignal] = useState(null);

const [stream,setStream] = useState(null);

const [callEnded,setCallEnded] = useState(false);

const [callStartTime, setCallStartTime] = useState(null);

const myVideo = useRef();
const userVideo = useRef();
const connectionRef = useRef();

  const chatRef = useRef(null);
  const bottomRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const typingTimeout = useRef(null);
  const emojiRef = useRef(null);
  const menuRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
const [callActive, setCallActive] = useState(false);


const [muted, setMuted] = useState(false);

const [videoOff,setVideoOff] = useState(false);

const [callTime, setCallTime] = useState(0);



useEffect(() => {

let timer;

if(callStartTime){

timer = setInterval(() => {

setCallTime(
Math.floor((Date.now() - callStartTime) / 1000)
);

},1000);

}

return () => clearInterval(timer);

},[callStartTime]);



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
            console.log("SERVER MESSAGES:", res.data);
            setMessages(res.data);

        // ================= SEEN UPDATE =================

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

  const seenHandler = ({ sender, receiver }) => {

    console.log("SEEN DATA:", sender, receiver);

    setMessages((prev) =>
      prev.map((msg) => {

        if (
          msg.sender.toString() === sender.toString() &&
          msg.receiver.toString() === receiver.toString()
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

}, []);


useEffect(()=>{

  socket.on("messageDeleted",(data)=>{

    setMessages((oldMessages)=>{

      return oldMessages.filter(
        (msg)=>msg._id !== data.messageId
      );

    });

  });


  return ()=>{

    socket.off("messageDeleted");

  };


},[]);




// ================= CALL LISTENER =================


useEffect(()=>{

socket.on("incomingCall", (data) => {

  console.log("Incoming Call:", data);

  setIncomingCall(data);

  setCaller(data.caller);
  setCallerSignal(data.signal);
  setCallType(data.type);

});


return ()=>{

socket.off("incomingCall");

};


},[]);

useEffect(()=>{

  const rejectHandler = () => {

    console.log("CALL REJECTED");

    if(connectionRef.current){
      connectionRef.current.destroy();
    }

    if(stream){
      stream.getTracks().forEach(track=>{
        track.stop();
      });
    }

    if(myVideo.current){
      myVideo.current.srcObject = null;
    }

    if(userVideo.current){
      userVideo.current.srcObject = null;
    }

    setStream(null);
    setCallActive(false);

    alert("Call Rejected");

  };


  socket.on("callRejected", rejectHandler);


  return ()=>{

    socket.off("callRejected", rejectHandler);

  };


},[stream]);

useEffect(()=>{

socket.on("callEnded",()=>{

console.log("CALL ENDED");


if(connectionRef.current){
connectionRef.current.destroy();
}


if(stream){


stream.getTracks().forEach(track=>{
track.stop();
});

}


if(myVideo.current){
myVideo.current.srcObject=null;
}


if(userVideo.current){
userVideo.current.srcObject=null;
}

setIncomingCall(null);
setStream(null);

setCallActive(false);
setCallTime(0);

setCallStartTime(null);


});


return ()=>{

socket.off("callEnded");

};


},[stream]);


// ================= CALL ACCEPT LISTENER =================

useEffect(()=>{

  socket.on("callAccepted",(signal)=>{

console.log("CALL ACCEPTED");


if(connectionRef.current){

connectionRef.current.signal(signal);

}

});


  return ()=>{

    socket.off("callAccepted");

  };


},[]);


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
// ================= UPLOAD FILE =================

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

    // ================= EMPTY CHECK =================

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

      replyTo: replyMessage ? replyMessage._id : "",

      replyText: replyMessage ? replyMessage.text : "",

      image: imageUrl,

      file: fileUrl,

      fileName: fileName,

      seen: false,

      createdAt: new Date()

    };

   // ================= SAVE DATABASE =================

    const res = await api.post(
      "/messages",
      newMessage
    );

    // ================= ADD MESSAGE LOCALLY =================

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

    // ================= SEND SOCKET EVENT =================

    socket.emit(
      "sendMessage",
      res.data
    );

   // ================= STOP TYPING =================

    socket.emit(
      "stopTyping",
      {

        sender: user._id,

        receiver: selectedUser._id

      }
    );

    // ================= CLEAR INPUT =================
    setMessage("");

    setReplyMessage(null);

    setImage(null);

    setImagePreview("");

    setFile(null);

  }

  catch (err) {

    console.log(err);

  }

};

// ================= location =================

const sendLocation = () => {

  if (!selectedUser) return;

  navigator.geolocation.getCurrentPosition(

    async (position) => {

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const locationLink =
        `https://www.google.com/maps?q=${latitude},${longitude}`;

      const newMessage = {

        sender: user._id,
        receiver: selectedUser._id,
        text: locationLink,
        seen: false,
        createdAt: new Date()

      };

      const res = await api.post(
        "/messages",
        newMessage
      );

      setMessages((prev) => [
        ...prev,
        res.data
      ]);

      socket.emit(
        "sendMessage",
        res.data
      );

    },

    () => {
      alert("Location Permission Denied");
    }

  );

};

// ================= DELETE MESSAGE =================

const deleteMessage = async (msg) => {
    

  try {

    await api.delete(`/messages/${msg._id}`);


    setMessages((prev)=>
      prev.filter(
        (m)=>m._id !== msg._id
      )
    );


    socket.emit("deleteMessage",{

      messageId: msg._id,

      receiver: msg.receiver

    });


  } catch(err){

    console.log(err);

  }

};

{/* ================= START CALL ================= */}


const startCall = async(type)=>{
  setCallType(type);

try{

  setCallEnded(false);

const currentStream =
await navigator.mediaDevices.getUserMedia({

video: type==="video",

audio:true

});


setStream(currentStream);


if(myVideo.current){

myVideo.current.srcObject=currentStream;

}

setCallTime(0);
setCallActive(true);

const peer = new Peer({
  initiator: true,
  trickle: false,
  stream: currentStream,
  config:{
    iceServers:[
      {
        urls:"stun:stun.l.google.com:19302"
      }
    ]
  }
});

peer.on("connect",()=>{

setCallStartTime(Date.now());

setCallActive(true);

});

peer.on("stream", (remoteStream) => {

console.log("REMOTE STREAM:", remoteStream);

if (userVideo.current) {
    userVideo.current.srcObject = remoteStream;
    userVideo.current.play();
}

if (myVideo.current) {
    myVideo.current.play();
}

});

peer.on("signal", (signalData) => {

  socket.emit("callUser", {
    caller: user._id,
    receiver: selectedUser._id,
    type,
    signal: signalData
  });

});





peer.on("error", (err) => {
  console.log("Peer Error:", err);
});

peer.on("close", () => {
  console.log("Call Ended");
});

connectionRef.current = peer;


}catch(err){

console.log(err);

}

};

// ================= MUTE FUNCTION =================

const toggleMute = () => {

  if(stream){

    stream.getAudioTracks()[0].enabled =
    !stream.getAudioTracks()[0].enabled;

    setMuted(
      !stream.getAudioTracks()[0].enabled
    );

  }

};


const toggleVideo = () => {

  if(stream){

    stream.getVideoTracks().forEach(track=>{

      track.enabled = !track.enabled;

    });

    setVideoOff(!videoOff);

  }

};

// ================= END CALL =================


const endCall = () => {

  if(connectionRef.current){
    connectionRef.current.destroy();
    connectionRef.current = null;
  }

  if(stream){
    stream.getTracks().forEach(track=>track.stop());
  }

  if(myVideo.current){
    myVideo.current.srcObject = null;
  }

  if(userVideo.current){
    userVideo.current.srcObject = null;
  }

  socket.emit("endCall",{
    receiver:selectedUser._id
  });

  setIncomingCall(null);
  setStream(null);
  setCallActive(false);
  setCallTime(0);
  setCallStartTime(null);

};



useEffect(() => {

  const handleClickOutside = (event) => {

    if (
      emojiRef.current &&
      !emojiRef.current.contains(event.target)
    ) {
      setShowEmoji(false);
    }

  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {

    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );

  };

}, []);

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


<div
ref={menuRef}
  style={{
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    fontSize: "22px",
    color: "#54656f",
    cursor: "pointer",
    position: "relative"
  }}
>
<FiVideo
  onClick={()=>{
    startCall("video");
  }}
/>

  <FiPhone
  onClick={()=>{
    startCall("audio");
  }}
/>

<FiMoreVertical
  onClick={() => setShowMenu(!showMenu)}
/>

</div>

</div>

{showMenu && (
  <div
    style={{
      position: "absolute",
      top: "40px",
      right: "0",
      width: "180px",
      background: "#fff",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      zIndex: 1000,
      overflow: "hidden"
    }}
  >
   <div
      style={{padding:"12px",cursor:"pointer", color: "black"}}
      onClick={()=>{
        alert("Share Contact");
        setShowMenu(false);
      }}
    >
      📤 Share Contact
    </div>

    <div
      style={{padding:"12px",cursor:"pointer", color: "black"}}
      onClick={()=>{
        alert("Add to Favourite");
        setShowMenu(false);
      }}
    >
      ⭐ Add to Favourite
    </div>


    <div
      style={{ padding: "12px", cursor: "pointer", color: "red" }}
      onClick={() => {
        alert("Clear Chat");
        setShowMenu(false);
      }}
    >
      🗑️ Clear Chat
    </div>

    

    <div
      style={{ padding: "12px", cursor: "pointer", color: "red" }}
      onClick={() => {
        alert("Block User");
        setShowMenu(false);
      }}
    >
      🚫 Block User
    </div>

  </div>
)}

{
incomingCall && (

<div
style={{
position:"fixed",
top:"20px",
right:"20px",
background:"#fff",
padding:"20px",
borderRadius:"10px",
boxShadow:"0 2px 10px gray",
zIndex:2000
}}
>

<h3>
Incoming Call
</h3>


<p>
{
incomingCall.type==="video"
?
"📹 Video Call"
:
"📞 Voice Call"
}
</p>


<button



onClick={async () => {

  const currentStream = await navigator.mediaDevices.getUserMedia({
  video: incomingCall.type === "video",
  audio: true,
});

setStream(currentStream);

if (myVideo.current) {
  myVideo.current.srcObject = currentStream;
}

  const peer = new Peer({
  initiator: false,
  trickle: false,
  stream: currentStream,
  config:{
    iceServers:[
      {
        urls:"stun:stun.l.google.com:19302"
      }
    ]
  }
});


 peer.on("connect",()=>{

setCallStartTime(Date.now());

setCallActive(true);

});

  peer.on("signal", (signal) => {

    socket.emit("acceptCall", {
      caller: incomingCall.caller,
      receiver: user._id,
      signal
    });

  });

 peer.on("stream",(remoteStream)=>{

console.log("REMOTE STREAM:", remoteStream);

if(userVideo.current){

userVideo.current.srcObject = remoteStream;

userVideo.current.onloadedmetadata = () => {
    userVideo.current.play();
};

}

setCallActive(true);

});

peer.signal(incomingCall.signal);

connectionRef.current = peer;

setIncomingCall(null);

setCallActive(true);

}}

style={{
background:"green",
color:"white",
padding:"10px",
marginRight:"10px",
border:"none",
borderRadius:"5px"
}}

>

Accept

</button>



<button

onClick={()=>{

socket.emit("rejectCall",{

caller: incomingCall.caller

});

setIncomingCall(null);

}}

style={{
background:"red",
color:"white",
padding:"10px",
border:"none",
borderRadius:"5px"
}}

>

Reject

</button>


</div>

)
}

{stream && callActive && (
  <div
    style={{
      position: "fixed",
      top: "80px",
      right: "20px",
      background: "#fff",
      padding: "10px",
      borderRadius: "10px",
      zIndex: 5000
    }}
  >

    <div
style={{
textAlign:"center",
fontSize:"18px",
fontWeight:"bold",
marginBottom:"10px"
}}
>
📞 {Math.floor(callTime / 60)}:
{callTime % 60 < 10 ? "0" : ""}
{callTime % 60}
</div>

    <video
      ref={myVideo}
      autoPlay
      muted
      playsInline
      style={{
        width: "200px",
        borderRadius: "10px"
      }}
    />

    <video
      ref={userVideo}
      autoPlay
      playsInline
      style={{
        width: "200px",
        marginTop: "10px",
        borderRadius: "10px"
      }}
    />

     <button
onClick={endCall}
style={{
marginTop:"10px",
width:"100%",
background:"red",
color:"white",
padding:"10px",
border:"none",
borderRadius:"8px",
cursor:"pointer"
}}
>
❌ End Call
</button>

<button
onClick={toggleMute}
style={{
marginTop:"10px",
width:"100%",
background:"#333",
color:"white",
padding:"10px",
border:"none",
borderRadius:"8px",
cursor:"pointer"
}}
>
{
muted
?
"🔇 Unmute"
:
"🎤 Mute"
}
</button>

{
callType === "video" && (

<button
onClick={toggleVideo}
style={{
marginTop:"10px",
width:"100%",
background:"#2196f3",
color:"white",
padding:"10px",
border:"none",
borderRadius:"8px",
cursor:"pointer"
}}
>
{
videoOff ? "📷 Camera On" : "🚫 Camera Off"
}
</button>

)
}

  </div>
)}


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

msg.sender?.toString() === user._id?.toString()

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

msg.sender?.toString() === user._id?.toString()

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

{
msg.replyText && (

<div
style={{
background:"#d0d0d0",
padding:"6px",
borderRadius:"6px",
marginBottom:"5px",
fontSize:"13px",
color:"#555"
}}
>

↩ {msg.replyText}

</div>

)
}


{
msg.text?.includes("google.com/maps") ? (

<a
  href={msg.text}
  target="_blank"
  rel="noreferrer"
  style={{
    textDecoration: "none",
    color: "inherit"
  }}
>

<div
style={{
width:"240px",
background:"#ffffff",
borderRadius:"15px",
overflow:"hidden",
boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
cursor:"pointer"
}}
>

 <div
    style={{
      height: "140px",
      background: "#d8f3dc",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "70px"
    }}
  ></div>


<div
style={{
padding:"12px"
}}
>

<div
style={{
fontWeight:"bold",
fontSize:"16px"
}}
>
Shared Location
</div>

<div
style={{
fontSize:"13px",
color:"#666",
marginTop:"5px"
}}
>
Tap to Open in Google Maps
</div>

</div>

</div>

</a>

) : (

<p>{msg.text}</p>

)
}



{
msg.sender?.toString() !== user._id?.toString() && (

<button
  onClick={() => setReplyMessage(msg)}
  style={{
    border: "none",
    background: "transparent",
    color: "blue",
    cursor: "pointer"
  }}
>
  Reply
</button>

)
}


{
msg.sender?.toString() === user._id?.toString() &&

<button

onClick={()=>{


console.log("Button clicked");
console.log("Message ID:", msg._id);


deleteMessage(msg);

}}

style={{

background:"red",
color:"white",
border:"none",
borderRadius:"5px",
padding:"5px",
marginTop:"5px",
cursor:"pointer"

}}

>

Delete

</button>

}


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

msg.sender?.toString() === user._id?.toString()


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

{
replyMessage && (

<div
style={{
background:"#fff",
padding:"8px",
margin:"5px 10px",
borderLeft:"4px solid green",
borderRadius:"5px"
}}
>

<div>
Replying to:
</div>

<b>
{replyMessage.text}
</b>


<button

onClick={()=>setReplyMessage(null)}

style={{
float:"right",
border:"none",
background:"transparent",
cursor:"pointer"
}}

>
❌
</button>


</div>

)
}

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

{/* IMAGE INPUT (Hidden) */}

<input
  id="imageInput"
  type="file"
  accept="image/*"
  style={{ display: "none" }}
  onChange={(e) => {
    const img = e.target.files[0];

    if (img) {
      setImage(img);
      setImagePreview(URL.createObjectURL(img));
    }
  }}
/>

<label
  htmlFor="imageInput"
  style={{
    fontSize: "28px",
    cursor: "pointer"
  }}
>
🖼️
</label>

{/* FILE / VIDEO INPUT (Hidden) */}

<input
  id="fileInput"
  type="file"
  accept="video/*,.pdf,.doc,.docx,.zip"
  style={{ display: "none" }}
  onChange={(e) => {
    const f = e.target.files[0];

    if (f) {
      setFile(f);
    }
  }}
/>

<label
  htmlFor="fileInput"
  style={{
    fontSize: "28px",
    cursor: "pointer"
  }}
>
📎
</label>

{/* EMOJI BUTTON */}

<div
  ref={emojiRef}
  style={{
    position: "relative"
  }}
>

  <button
    type="button"
    onClick={() => setShowEmoji(!showEmoji)}
    style={{
      fontSize: "24px",
      background: "none",
      border: "none",
      cursor: "pointer"
    }}
  >
    😀
  </button>

  {showEmoji && (

    <div
      style={{
        position: "absolute",
        bottom: "50px",
        left: "0",
        zIndex: 1000
      }}
    >

      <EmojiPicker
        onEmojiClick={(emojiData) => {

          setMessage(
            (prev) => prev + emojiData.emoji
          );

          setShowEmoji(false);

        }}
      />

    </div>

  )}

</div>


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
  onClick={sendLocation}
  style={{
    background: "none",
    border: "none",
    fontSize: "25px",
    cursor: "pointer"
  }}
>
  📍
</button>

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