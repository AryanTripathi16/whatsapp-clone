const userService = require("../services/userService");

const getUsers = async (req, res) => {

    try {

        const users = await userService.getUsers();

        res.json(users);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {
    getUsers
};