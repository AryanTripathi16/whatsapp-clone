import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";

import socket from "../services/socket";


function Chat() {


  const [selectedUser, setSelectedUser] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [lastSeen, setLastSeen] = useState({});





  useEffect(() => {


    const currentUser = JSON.parse(
      localStorage.getItem("user")
    );



    if (!currentUser?._id) return;



    // Socket Connect

    if (!socket.connected) {

      socket.connect();

    }



    // Add Current User

    socket.emit(
      "addUser",
      currentUser._id
    );






    // Online Users

    const onlineHandler = (users)=>{

      setOnlineUsers(users);

    };





    // Last Seen

    const lastSeenHandler = (data)=>{

      setLastSeen(data);

    };





    socket.on(
      "onlineUsers",
      onlineHandler
    );



    socket.on(
      "lastSeen",
      lastSeenHandler
    );







    return ()=>{


      socket.off(
        "onlineUsers",
        onlineHandler
      );


      socket.off(
        "lastSeen",
        lastSeenHandler
      );


    };



  }, []);









  return (

    <div

      style={{

        display:"flex",

        width:"100%",

        height:"100vh",

        overflow:"hidden",

        background:"#f0f2f5"

      }}

    >



      <Sidebar

        setSelectedUser={
          setSelectedUser
        }

      />





      <ChatBox

        selectedUser={
          selectedUser
        }

        onlineUsers={
          onlineUsers
        }

        lastSeen={
          lastSeen
        }

      />





    </div>

  );

}


export default Chat;