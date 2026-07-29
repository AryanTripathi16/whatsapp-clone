const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");


// Register
const register = async ({ name, email, password }) => {

    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    return {
        message: "User Registered Successfully",
        user
    };
};


// Login
const login = async ({ email, password }) => {

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid Password");
    }

    return {

        message: "Login Successful",

        token: generateToken(user._id),

        user: {

            id: user._id,

            name: user.name,

            email: user.email

        }

    };

};

module.exports = {
    register,
    login
};