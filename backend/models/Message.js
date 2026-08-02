import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    file: {
      type: String,
      default: "",
    },

    fileName: {
      type: String,
      default: "",
    },

    replyTo: {
      type: String,
      default: "",
    },

    replyText: {
      type: String,
      default: "",
    },

    seen: {
      type: Boolean,
      default: false,
    },
    
    status: {
  type: String,
  enum: ["sent", "delivered", "seen"],
  default: "sent",
},


  forwarded: {
  type: Boolean,
  default: false,
},

originalSender:{
  type:String,
  default:""
},


reaction: {
  type: String,
  default: "",
},


    deleted:{
    type:Boolean,
    default:false
  }
  
  },
  
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", messageSchema);