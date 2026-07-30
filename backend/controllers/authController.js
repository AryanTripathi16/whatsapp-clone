import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ================= REGISTER =================

export const register = async (req, res) => {

  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {

      return res.status(400).json({
        message: "All fields are required",
      });

    }

    const exist = await User.findOne({ email });

    if (exist) {

      return res.status(400).json({
        message: "User Already Exists",
      });

    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({

      name,

      email,

      password: hashedPassword,

      avatar: "/uploads/default.png",

    });

    const token = jwt.sign(

      {
        id: user._id,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      }

    );

    res.status(201).json({

      message: "Registration Successful",

      token,

      user,

    });

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};

// ================= LOGIN =================

export const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {

      return res.status(400).json({

        message: "Email and Password are required",

      });

    }

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(404).json({

        message: "User Not Found",

      });

    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {

      return res.status(400).json({

        message: "Invalid Password",

      });

    }

    const token = jwt.sign(

      {
        id: user._id,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      }

    );

    res.status(200).json({

      message: "Login Successful",

      token,

      user,

    });

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};