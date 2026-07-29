const express = require("express");
const router = express.Router();

const {
    sendMessage,
    getMessages,
    updateStatus
} = require("../controllers/messageController");

router.post("/", sendMessage);

router.get("/:sender/:receiver", getMessages);

router.put("/status/:id", updateStatus);

module.exports = router;