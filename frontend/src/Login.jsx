import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


function Login() {

  const navigate = useNavigate();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



  const login = async () => {


    try {


      const response = await axios.post(

        "http://localhost:8000/api/auth/login",

        {
          email,
          password
        }

      );



      console.log("Login Response:", response.data);



      // Save Token

      localStorage.setItem(

        "token",

        response.data.token

      );



      // Save User Data

      localStorage.setItem(

        "user",

        JSON.stringify(response.data.user)

      );



      console.log(
        "Saved User:",
        response.data.user
      );



      alert("Login Successful");



      navigate("/chat");



    } catch(error) {


      console.log(error);



      if(error.response){

        alert(error.response.data.message);

      }

      else{

        alert("Server not connected");

      }


    }


  };





  return (

    <div>


      <h1>
        WhatsApp Login
      </h1>



      <input

        type="email"

        placeholder="Enter Email"

        value={email}

        onChange={(e)=>setEmail(e.target.value)}

      />



      <br/><br/>



      <input

        type="password"

        placeholder="Enter Password"

        value={password}

        onChange={(e)=>setPassword(e.target.value)}

      />



      <br/><br/>



      <button onClick={login}>

        Login

      </button>



      <br/><br/>



      <Link to="/register">

        Create New Account

      </Link>



    </div>

  );

}


export default Login;