import { useState } from "react";
import api from "../services/api";


function Profile(){


const user = JSON.parse(
localStorage.getItem("user")
);

useState(user?.about || "")
useState(user?.phone || "")

const [about,setAbout] = useState(
user?.about || ""
);

const [phone,setPhone] = useState(
user?.phone || ""
);

const [image,setImage] = useState(null);


const [preview,setPreview] = useState(
    

user?.avatar
?
`http://localhost:5001${user.avatar}`
:
""

);






const uploadImage = async()=>{


try{


if(!image){

alert("Select Image First");

return;

}




const formData = new FormData();


formData.append(
"avatar",
image
);



formData.append(
"userId",
user._id
);





const res = await api.post(

"/upload/avatar",

formData,

{

headers:{

"Content-Type":"multipart/form-data"

}

}

);





localStorage.setItem(

"user",

JSON.stringify(res.data.user)

);



setPreview(

`http://localhost:5001${res.data.user.avatar}`

);



alert(
"Profile Image Updated"
);



}catch(error){

console.log(error);

}


};


const updateProfile = async()=>{

  try{

    console.log("Sending:",{
      about,
      phone
    });


    const res = await api.put(
      `/users/${user._id}`,
      {
        about: about,
        phone: phone
      }
    );


    console.log("Response:", res.data);


    localStorage.setItem(
      "user",
      JSON.stringify(res.data)
    );


    alert("Profile Updated");


  }
  catch(error){

    console.log(
      "UPDATE ERROR:",
      error.response?.data || error.message
    );

  }

};










return (

<div>


<h2>

Profile Photo

</h2>





{

preview &&

<img

src={preview}

alt="profile"

width="150"

height="150"

style={{

borderRadius:"50%",

objectFit:"cover"

}}

/>

}


<h2>
{user?.name}
</h2>







<input
id="profileImage"
type="file"
accept="image/*"
style={{
display:"none"
}}
onChange={(e)=>{

const file=e.target.files[0];

setImage(file);

setPreview(
URL.createObjectURL(file)
);

}}
/>


<label
htmlFor="profileImage"
style={{
fontSize:"40px",
cursor:"pointer"
}}
>
📷
</label>





<br/><br/>





<button

onClick={uploadImage}

>

Upload

</button>

<br/><br/>


<input

type="text"

placeholder="Phone Number"

value={phone}

onChange={(e)=>setPhone(e.target.value)}

style={{
padding:"10px",
width:"250px"
}}



/>


<br/><br/>


<textarea

placeholder="About"

value={about}

onChange={(e)=>setAbout(e.target.value)}

style={{
padding:"10px",
width:"250px",
height:"80px"
}}

/>


<br/><br/>


<button

onClick={updateProfile}

style={{
padding:"10px 20px",
background:"#25D366",
color:"white",
border:"none",
borderRadius:"5px",
cursor:"pointer"
}}

>

Save Profile

</button>



</div>

);


}


export default Profile;