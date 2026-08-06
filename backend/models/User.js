import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "/uploads/default.png",
    },

about: {
  type: String,
  default: "Hey there! I am using WhatsApp"
},

phone: {
  type: String,
  default: ""
},

  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);