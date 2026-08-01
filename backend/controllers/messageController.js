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
  replyTo,
  replyText,
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

      replyTo: replyTo || "",

      replyText: replyText || "",

      seen: false,

      status: "sent",

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

  deleted: false,

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



// ================= DELETE MESSAGE =================

export const deleteMessage = async (req, res) => {

  try {

    const { id } = req.params;

    console.log("DELETE ID:", id);

    const message = await Message.findById(id);

    console.log("MESSAGE:", message);

    if (!message) {

      return res.status(404).json({
        message: "Message not found",
      });

    }


      await Message.findByIdAndUpdate(
        id,
        {
            deleted: true
        }
      );
  
    res.json({
      success: true,
      message: "Message deleted",
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};