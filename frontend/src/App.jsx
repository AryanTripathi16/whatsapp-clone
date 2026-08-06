import { Routes, Route } from "react-router-dom";


import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";

import Status from "./pages/Status";

function App() {


  return (

    <Routes>


      {/* Login */}

      <Route
        path="/"
        element={<Login />}
      />



      {/* Register */}

      <Route
        path="/register"
        element={<Register />}
      />



      {/* Home */}

      <Route
        path="/home"
        element={<Home />}
      />



      {/* Chat */}

      <Route
        path="/chat"
        element={<Chat />}
      />



      {/* Profile */}

      <Route
        path="/profile"
        element={<Profile />}
      />



      {/* Status */}

      <Route path="/status" element={<Status />} />


    </Routes>

  );

}


export default App;