import { useEffect, useState } from "react";
import api from "../services/api";

import socket from "../services/socket";

function Status({setShowStatus}){

const [text,setText] = useState("");
const [statuses,setStatuses] = useState([]);
const [selectedStatus,setSelectedStatus] = useState(null);


const [progress,setProgress] = useState(100);

const user = JSON.parse(
localStorage.getItem("user")
);

const [reply,setReply] = useState("");

const [showSeen,setShowSeen] = useState(false);

const [seenUsers,setSeenUsers] = useState([]);

const [showMenu,setShowMenu] = useState(null);

const [viewCount,setViewCount] = useState(0);


// LOAD STATUS

useEffect(()=>{

loadStatus();


const newStatus = ()=>{

    loadStatus();

};


const deletedStatus = (data)=>{


setStatuses((prev)=>


prev.filter(
(status)=>status._id !== data.statusId
)


);


};


socket.on(
"statusUpdated",
newStatus
);


socket.on(
"statusDeleted",
deletedStatus
);



return ()=>{


socket.off(
"statusUpdated",
newStatus
);


socket.off(
"statusDeleted",
deletedStatus
);


};


},[]);


const loadStatus = async()=>{

try{

const res = await api.get("/status");

console.log("STATUS DATA:",res.data);

const myStatus = res.data.filter(
(status)=>status.user._id.toString() === user._id.toString()
);

const otherStatus = res.data.filter(
(status)=>status.user._id.toString() !== user._id.toString()
);


setStatuses([
...myStatus,
...otherStatus
]);

}
catch(err){

console.log(err);

}

};



useEffect(()=>{

if(!selectedStatus) return;


setProgress(0);


const start = Date.now();


const interval = setInterval(()=>{


const elapsed = Date.now() - start;


const value = (elapsed / 15000) * 100;


setProgress(value);



if(value >= 100){

clearInterval(interval);

setSelectedStatus(null);

}


},100);



return ()=>clearInterval(interval);


},[selectedStatus]);


const isSeen = (status)=>{

  // apna status hamesha grey rakho
  if(
    status.user._id.toString() === user._id.toString()
  ){
    return true;
  }


  return status.seenUsers?.some(
    (item)=>
      item.user?._id?.toString() === user._id.toString()
  );

};




// POST STATUS

const postStatus = async()=>{

if(!text.trim()){

alert("Write something");

return;

}


try{


const res = await api.post("/status",{

user:user._id,

text:text

});


socket.emit(
"newStatus",
res.data
);


setText("");

alert("Status Posted");




// reload status list

loadStatus();


}
catch(err){

console.log(err);

}


};

// Status reply

const sendStatusReply = async () => {

  if (!reply.trim()) return;

  try {

    const data = {
      sender: user._id,
      receiver: selectedStatus.user._id,
      text: reply,
      replyText: `Reply to status: ${selectedStatus.text}`,
      status: "sent",
      createdAt: new Date()
    };

    const res = await api.post("/messages", data);

    socket.emit("sendMessage", res.data);

    setReply("");

    alert("Reply sent");

    setSelectedStatus(null);

  } catch (err) {
    console.log(err);
  }

};


const deleteStatus = async(id)=>{

try{

await api.delete(`/status/${id}`);

socket.emit(
"deleteStatus",
{
statusId:id
}
);

alert("Status deleted");

setShowMenu(false);

setSelectedStatus(null);

loadStatus();

}
catch(err){

console.log(err);

}

};

// Seen list

const showSeenList = async()=>{

try{

const res = await api.get(
`/status/seen/${selectedStatus._id}`
);

console.log("SEEN DATA:",res.data);

setSeenUsers(res.data);

setShowSeen(true);

}
catch(err){

console.log(err);

}

};


// View count

const getViewCount = async()=>{

if(!selectedStatus) return;


try{

const res = await api.get(
`/status/views/${selectedStatus._id}`
);


setViewCount(res.data.views);


}
catch(err){

console.log(err);

}

};



return (


<div
style={{
position:"fixed",
top:0,
left:0,
width:"100vw",
height:"100vh",
background:"#fff",
padding:"20px",
boxSizing:"border-box",
overflowY:"auto",
zIndex:999
}}
>


<h2
style={{
color:"black",
fontSize:"32px",
margin:"0",
textAlign:"left",
paddingBottom:"15px"
}}
>
updates
</h2>

<h2
style={{
color:"black",
margin:"0",
textAlign:"left",
paddingBottom:"15px"
}}
>
Status
</h2>

<div
style={{
display:"flex",
alignItems:"center",
gap:"15px",
width:"100%"
}}
>

<button

onClick={()=>setShowStatus(false)}

style={{
padding:"10px",
background:"#555",
color:"white",
border:"none",
borderRadius:"5px",
cursor:"pointer"
}}

>
← Back
</button>


<input

placeholder="Add status"

value={text}

onChange={(e)=>setText(e.target.value)}

style={{
padding:"10px",
flex:1,
fontSize:"16px",
border:"1px solid #ccc",
borderRadius:"25px"
}}

/>

<button

onClick={postStatus}

style={{
padding:"10px",
background:"#25D366",
color:"white",
border:"none",
borderRadius:"8px"
}}

>
Post
</button>


</div>





<hr/>


<h3>Recent updates</h3>



{

statuses.map((status)=>(

<div
key={status._id}

style={{
display:"flex",
alignItems:"center",
gap:"15px",
padding:"12px",
marginBottom:"8px",
cursor:"pointer",
position:"relative",
background:"#fff",
borderRadius:"12px",
boxShadow:"0 1px 3px rgba(0,0,0,0.15)"
}}

>


<div
onClick={async()=>{

setSelectedStatus(status);



if(status.user._id.toString() !== user._id.toString()){

await api.post("/status/seen",{
statusId:status._id,
userId:user._id
});


setTimeout(()=>{
    loadStatus();
},500);

}

}}

style={{
display:"flex",
alignItems:"center",
gap:"10px",
flex:1
}}
>


<img

src={
status.user?.avatar
?
`http://localhost:5001${status.user.avatar}`
:
"https://via.placeholder.com/50"
}

style={{
width:"50px",
height:"50px",
borderRadius:"50%",
border:
isSeen(status)
?
"3px solid #ccc"
:
"3px solid #25D366",
padding:"2px",
objectFit:"cover"
}}

/>


<div>

<b style={{color:"black"}}>
{
status.user?._id?.toString() === user._id.toString()
?
"My status"
:
status.user?.name
}
</b>


<p
style={{
margin:"5px 0",
color:"black",
fontSize:"14px"
}}
>
{status.text}
</p>

</div>


</div>


{
status.user._id.toString() === user._id.toString() && (

<div
style={{
position:"relative",
zIndex:10
}}
>

<button

onClick={(e)=>{

e.stopPropagation();

setShowMenu(
showMenu === status._id ? null : status._id
);

}}


style={{
background:"transparent",
border:"none",
fontSize:"28px",
cursor:"pointer",
color:"black",
display:"block"
}}

>
⋮
</button>



{
showMenu === status._id && (

<div

style={{
position:"absolute",
right:"0",
top:"35px",
background:"white",
color:"black",
padding:"10px 20px",
borderRadius:"10px",
boxShadow:"0 0 10px #aaa",
zIndex:1000
}}

>


<button

onClick={(e)=>{

e.stopPropagation();

deleteStatus(status._id);

}}

style={{
background:"none",
border:"none",
color:"red",
fontSize:"16px",
cursor:"pointer"
}}

>

Delete

</button>


</div>

)

}


</div>

)
}


</div>


))

}


{
selectedStatus && (

<div
style={{
position:"fixed",
top:0,
left:0,
width:"100vw",
height:"100vh",
background:"#000",
color:"#fff",
zIndex:2000,
display:"flex",
flexDirection:"column",
alignItems:"center",
justifyContent:"center"
}}
>


<div
style={{
position:"absolute",
top:"8px",
left:"20px",
right:"20px",
height:"4px",
background:"#555",
borderRadius:"5px"
}}
>

<div
style={{
height:"100%",
width:`${progress}%`,
background:"white",
borderRadius:"5px"
}}
></div>

</div>



<button
onClick={()=>setSelectedStatus(null)}
style={{
position:"absolute",
top:"20px",
right:"20px",
background:"transparent",
color:"white",
border:"none",
fontSize:"30px"
}}
>
✕
</button>




<div
style={{
position:"absolute",
top:"20px",
left:"20px",
display:"flex",
alignItems:"center",
gap:"10px"
}}
>

<img
src={
selectedStatus.user?.avatar
?
`http://localhost:5001${selectedStatus.user.avatar}`
:
"https://via.placeholder.com/50"
}
style={{
width:"45px",
height:"45px",
borderRadius:"50%",
objectFit:"cover",
border:"2px solid white"
}}
/>

<div
style={{
display:"flex",
flexDirection:"column"
}}
>

<b
style={{
fontSize:"18px"
}}
>
{selectedStatus.user?.name}
</b>


<small
style={{
color:"white",
fontSize:"12px",
marginTop:"3px"
}}
>
{new Date(selectedStatus.createdAt).toLocaleTimeString("en-US",{
hour:"2-digit",
minute:"2-digit",
hour12:true
})}
</small>

</div>



</div>





<p
style={{
fontSize:"30px",
textAlign:"center"
}}
>
{selectedStatus.text}
</p>

{
showSeen && (

<div
style={{
position:"fixed",
bottom:0,
left:0,
right:0,
background:"#fff",
color:"#000",
padding:"20px",
zIndex:3000,
borderRadius:"20px 20px 0 0"
}}
>

<h3>
Seen By
</h3>


{
seenUsers.length === 0 ?

<p>
No one seen yet
</p>

:

seenUsers.map((item)=>(

<div
key={item._id}
style={{
display:"flex",
alignItems:"center",
gap:"10px",
marginBottom:"10px"
}}
>

<img

src={
item.avatar
?
`http://localhost:5001${item.avatar}`
:
"http://localhost:5001/default-avatar.png"
}

style={{
width:"40px",
height:"40px",
borderRadius:"50%"
}}

/>


<div>

<b>
{item.name || "Unknown User"}
</b>

<p
style={{
margin:"2px 0",
fontSize:"12px",
color:"#555"
}}
>
Seen at: {
item.seenAt
  ? new Date(item.seenAt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  : "Time not available"
}
</p>


</div>


</div>

))

}


<button
onClick={()=>setShowSeen(false)}
style={{
padding:"8px 20px"
}}
>
Close
</button>


</div>

)
}


{
selectedStatus.user._id.toString() === user._id.toString()

?

<div
style={{
position:"absolute",
bottom:"20px",
left:"20px",
right:"20px",
display:"flex",
justifyContent:"center"
}}
>

<button

onClick={()=>{

showSeenList();

getViewCount();

}}

style={{
background:"#333",
color:"white",
padding:"12px 30px",
border:"none",
borderRadius:"25px",
fontSize:"16px",
cursor:"pointer"
}}

>

👁 {viewCount} Views

</button>



</div>


:

<div
style={{
position:"absolute",
bottom:"20px",
left:"20px",
right:"20px",
display:"flex",
gap:"10px"
}}
>

<input

placeholder="Reply..."

value={reply}

onChange={(e)=>setReply(e.target.value)}

style={{
flex:1,
padding:"12px",
borderRadius:"25px",
border:"none"
}}

/>


<button

onClick={sendStatusReply}

style={{
width:"45px",
height:"45px",
borderRadius:"50%",
background:"#25D366",
color:"white",
border:"none"
}}

>
➤
</button>


</div>

}

)




</div>

)
}



</div>

);

}

export default Status;