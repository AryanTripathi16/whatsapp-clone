import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";

import socket from "../services/socket";

import Status from "./Status";

function Chat() {


  const [selectedUser, setSelectedUser] = useState(null);

  const [showStatus, setShowStatus] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [lastSeen, setLastSeen] = useState({});

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);



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

  // MOBILE APP

  useEffect(() => {

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };

}, []);









  return (

    <div

      style={{

        display:"flex",

        width:"100vw",

        height:"100vh",

        overflow:"hidden",

        background:"#f0f2f5"

      }}

    >


     {
showStatus ? (

<Status setShowStatus={setShowStatus}/>

) : (

<>

{
(!isMobile || !selectedUser) && (

<Sidebar
selectedUser={selectedUser}
setSelectedUser={setSelectedUser}
isMobile={isMobile}
setShowStatus={setShowStatus}
/>

)
}


{
(!isMobile || selectedUser) && (

<ChatBox

selectedUser={selectedUser}

onlineUsers={onlineUsers}

lastSeen={lastSeen}

goBack={() => setSelectedUser(null)}

isMobile={isMobile}

/>

)
}

</>

)
}




    </div>

  );

}


export default Chat;