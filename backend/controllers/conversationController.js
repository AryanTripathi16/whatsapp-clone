import Conversation from "../models/Conversation.js";

// Create New Conversation
export const createConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    const newConversation = new Conversation({
      members: [senderId, receiverId],
    });

    const savedConversation = await newConversation.save();

    res.status(201).json(savedConversation);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get User Conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: req.params.userId,
    })
      .populate("members", "-password")
      .populate("lastMessage");

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};