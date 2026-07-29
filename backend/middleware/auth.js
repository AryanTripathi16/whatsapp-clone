const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {

    try {

        const token = req.header("Authorization");

        if (!token) {

            return res.status(401).json({
                message: "Access Denied"
            });

        }

        const verified = jwt.verify(
            token.replace("Bearer ", ""),
            process.env.JWT_SECRET
        );

        req.user = verified;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid Token"
        });

    }

};

module.exports = auth;