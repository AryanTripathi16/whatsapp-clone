import React from "react";


function ChatHeader({ selectedUser }) {


if(!selectedUser){

return (

<div

style={{

padding:"15px",

borderBottom:"1px solid #ddd"

}}

>

<h3>

Select a chat

</h3>

</div>

);

}





return (

<div

style={{

display:"flex",

alignItems:"center",

gap:"15px",

padding:"12px 20px",

borderBottom:"1px solid #ddd",

background:"#fff"

}}

>





{/* Profile Image */}

<img

src={

selectedUser.avatar

?

`http://localhost:5001${selectedUser.avatar}`

:

"https://via.placeholder.com/50"

}

alt="profile"

width="50"

height="50"

style={{

borderRadius:"50%",

objectFit:"cover"

}}

/>







{/* User Details */}

<div>


<h3

style={{

margin:"0"

}}

>

{selectedUser.name}

</h3>




<small

style={{

color:"green"

}}

>

🟢 Online

</small>



</div>





</div>

);


}


export default ChatHeader;