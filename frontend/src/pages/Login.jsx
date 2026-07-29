import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {

    e.preventDefault();

    if (!email || !password) {

      alert("Please fill all fields");

      return;

    }

    try {

      setLoading(true);

      const response = await api.post("/auth/login", {

        email,

        password

      });

      login(response.data);

      alert("Login Successful");

      navigate("/chat");

    } catch (error) {

      alert(

        error.response?.data?.message ||

        "Login Failed"

      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="login-container">

      <form
        className="login-form"
        onSubmit={submitHandler}
      >

        <h1>WhatsApp Clone</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button type="submit">

          {loading ? "Please Wait..." : "Login"}

        </button>

        <p>

          Don't have an account?

          <Link to="/register">

            Register

          </Link>

        </p>

      </form>

    </div>

  );

}

export default Login;