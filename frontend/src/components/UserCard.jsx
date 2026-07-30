function UserCard({
user,
setSelectedUser,
onlineUsers
}){


return (

<div

onClick={()=>setSelectedUser(user)}

style={{

padding:"15px",

borderBottom:"1px solid #ddd",

cursor:"pointer",

display:"flex",

alignItems:"center",

gap:"10px"

}}

>


<img

src={

user.avatar

?

`http://localhost:5001${user.avatar}`

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





<div>


<h4

style={{

margin:"0"

}}

>

{user.name}

</h4>





{

onlineUsers?.includes(user._id)

?

<p

style={{

color:"green",

margin:"5px 0"

}}

>

🟢 Online

</p>


:

<p

style={{

color:"gray",

margin:"5px 0"

}}

>

⚪ Offline

</p>


}



</div>




</div>

);


}


export default UserCard;