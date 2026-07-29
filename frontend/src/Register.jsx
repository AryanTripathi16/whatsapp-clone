import { useState } from "react";
import axios from "axios";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {

      const response = await axios.post(
        "http://localhost:8000/api/auth/register",
        {
          name,
          email,
          password
        }
      );

      console.log(response.data);

      alert("Registration Successful");

    } catch (error) {

      console.log(error);
      alert("Registration Failed");

    }
  };


  return (
    <div>

      <h1>Create Account</h1>

      <input
        type="text"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={register}>
        Register
      </button>

    </div>
  );
}

export default Register;