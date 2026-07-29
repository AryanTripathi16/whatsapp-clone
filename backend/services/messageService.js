const Message = require("../models/Message");

const sendMessage = async (data) => {

    const message = await Message.create({
        sender: data.sender,
        receiver: data.receiver,
        message: data.message,
        status: "sent"
    });

    return message;

};

const getMessages = async (sender, receiver) => {

    return await Message.find({

        $or: [

            {
                sender,
                receiver
            },

            {
                sender: receiver,
                receiver: sender
            }

        ]

    }).sort({
        createdAt: 1
    });

};

const updateStatus = async (id, status) => {

    return await Message.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );

};

module.exports = {
    sendMessage,
    getMessages,
    updateStatus
};