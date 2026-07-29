const messageService = require("../services/messageService");

const sendMessage = async (req, res) => {

    try {

        const message = await messageService.sendMessage(req.body);

        res.status(201).json(message);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

const getMessages = async (req, res) => {

    try {

        const messages = await messageService.getMessages(
            req.params.sender,
            req.params.receiver
        );

        res.json(messages);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

const updateStatus = async (req, res) => {

    try {

        const message = await messageService.updateStatus(
            req.params.id,
            req.body.status
        );

        res.json(message);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {
    sendMessage,
    getMessages,
    updateStatus
};