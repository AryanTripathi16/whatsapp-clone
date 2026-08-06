function UserCard({
  user,
  setSelectedUser,
  onlineUsers,
  selectedUser,
}) {
  return (
    <div
      onClick={() => setSelectedUser && setSelectedUser(user)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 15px",
        cursor: "pointer",
        borderBottom: "1px solid #eee",
        background:
          selectedUser?._id === user._id
            ? "#ebf5ff"
            : "#fff",
        transition: "0.2s",
      }}
    >
      {/* Avatar */}

       <img
  src={
    user.avatar
      ? `http://localhost:5001${user.avatar}`
      : "https://via.placeholder.com/50"
  }
  alt={user.name}
  width="50"
  height="50"
  style={{
    borderRadius: "50%",
    objectFit: "cover",
  }}
/>

      {/* User Info */}

      <div
        style={{
          flex: 1,
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: "16px",
          }}
        >
          {user.name}
        </h4>

        <p
          style={{
            margin: "4px 0 0",
            fontSize: "13px",
            color: onlineUsers?.includes(user._id)
              ? "green"
              : "gray",
          }}
        >
          {onlineUsers?.includes(user._id)
            ? "🟢 Online"
            : "⚪ Offline"}
        </p>
      </div>
    </div>
  );
}

export default UserCard;