import express from "express";

import {
  sendMessage,
  getMessages,
  markSeen
} from "../controllers/messageController.js";


const router = express.Router();



// Send New Message

router.post(
  "/",
  sendMessage
);



// Get All Messages Between Two Users

router.get(
  "/:sender/:receiver",
  getMessages
);



// Mark Message Seen

router.put(
  "/seen",
  markSeen
);



// VERY IMPORTANT
// default export

export default router;