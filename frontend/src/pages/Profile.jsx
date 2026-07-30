import { useState } from "react";
import api from "../services/api";


function Profile(){


const user = JSON.parse(
localStorage.getItem("user")
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





<br/><br/>





<input

type="file"

accept="image/*"

onChange={(e)=>{


const file=e.target.files[0];


setImage(file);


setPreview(

URL.createObjectURL(file)

);


}}

/>





<br/><br/>





<button

onClick={uploadImage}

>

Upload

</button>



</div>

);


}


export default Profile;