import { useEffect, useState } from "react";
import api from "../services/api";
import socket from "../services/socket";
import UserCard from "./UserCard";

import { useNavigate } from "react-router-dom";

function Sidebar({
  selectedUser,
  setSelectedUser,
  isMobile,
  setShowStatus,
}) {

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [unread, setUnread] = useState({});
  const [search, setSearch] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));


  useEffect(() => {

    if (!currentUser) return;

    socket.connect();

    socket.emit("addUser", currentUser._id);

    loadUsers();

    const onlineHandler = (data) => {
      setOnlineUsers(data);
    };

    const messageHandler = (data) => {

      setLastMessages((prev) => ({
        ...prev,
        [data.sender]: data,
      }));

      setUnread((prev) => ({
        ...prev,
        [data.sender]: (prev[data.sender] || 0) + 1,
      }));

    };

    socket.on("onlineUsers", onlineHandler);
    socket.on("receiveMessage", messageHandler);

    return () => {
      socket.off("onlineUsers", onlineHandler);
      socket.off("receiveMessage", messageHandler);
    };

  }, []);

  const loadUsers = async () => {

    try {

      const res = await api.get("/users");

      setUsers(
        res.data.filter(
          (u) => u._id !== currentUser._id
        )
      );

    } catch (err) {

      console.log(err);

    }

  };

  const selectUser = (user) => {

    setSelectedUser(user);

    setUnread((prev) => ({
      ...prev,
      [user._id]: 0,
    }));

  };

  const filteredUsers = users.filter((user) =>
    user.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (

    <div
      style={{
        width: isMobile ? "100%" : "350px",
        minWidth: isMobile ? "100%" : "350px",
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >

      <h2
style={{
  padding: "15px",
  margin: 0,
  background: "#00a884",
  color: "white",
  cursor:"pointer"
}}
onClick={() => navigate("/profile")}
>
  WhatsApp
</h2>


<div
onClick={()=>setShowStatus(true)}
style={{
padding:"12px",
borderBottom:"1px solid #ddd",
cursor:"pointer"
}}
>
🟢 Status
</div>

      <div style={{ padding: "10px" }}>

        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "90%",
            padding: "10px",
            borderRadius: "29px",
            border: "1px solid #ccc",
          }}
        />

      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >

        {filteredUsers.map((user) => (

          <div
            key={user._id}
            onClick={() => selectUser(user)}
            style={{
              cursor: "pointer",
              background:
                selectedUser?._id === user._id
                  ? "#ebf5ff"
                  : "white",
            }}
          >

              <UserCard
  user={user}
  onlineUsers={onlineUsers}
  setSelectedUser={setSelectedUser}
  selectedUser={selectedUser}
/>

            {lastMessages[user._id] && (

              <div
                style={{
                  paddingLeft: "70px",
                  paddingBottom: "10px",
                  fontSize: "13px",
                  color: "#666",
                }}
              >

                <div>

                  {lastMessages[user._id].text
                    ? lastMessages[user._id].text.slice(0, 30)
                    : "📎 Media"}

                </div>

                <small>

                  {new Date(
                    lastMessages[user._id].createdAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}

                </small>

                {unread[user._id] > 0 && (

                  <span
                    style={{
                      float: "right",
                      marginRight: "15px",
                      background: "#25D366",
                      color: "white",
                      borderRadius: "50%",
                      padding: "4px 8px",
                      fontSize: "12px",
                    }}
                  >

                    {unread[user._id]}

                  </span>

                )}

              </div>

            )}

          </div>

        ))}

      </div>

    </div>

  );

}

export default Sidebar;