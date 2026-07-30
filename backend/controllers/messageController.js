import Message from "../models/Message.js";

// ================= SEND MESSAGE =================

export const sendMessage = async (req, res) => {

  try {

    const {
      sender,
      receiver,
      text,
      image,
      file,
      fileName,
    } = req.body;

    if (!sender || !receiver) {

      return res.status(400).json({
        message: "Sender and Receiver are required",
      });

    }

    const message = await Message.create({

      sender,

      receiver,

      text: text || "",

      image: image || "",

      file: file || "",

      fileName: fileName || "",

      seen: false,

    });

    res.status(201).json(message);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

// ================= GET MESSAGES =================

export const getMessages = async (req, res) => {

  try {

    const { sender, receiver } = req.params;

    const messages = await Message.find({

      $or: [

        {
          sender,
          receiver,
        },

        {
          sender: receiver,
          receiver: sender,
        },

      ],

    }).sort({
      createdAt: 1,
    });

    res.json(messages);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

// ================= MARK MESSAGE AS SEEN =================

export const markSeen = async (req, res) => {

  try {

    const { sender, receiver } = req.body;

    await Message.updateMany(

      {
        sender,
        receiver,
        seen: false,
      },

      {
        $set: {
          seen: true,
        },
      }

    );

    res.json({
      success: true,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};