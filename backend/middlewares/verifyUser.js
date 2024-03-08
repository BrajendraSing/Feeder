const jwt = require("jsonwebtoken");
const { error } = require("../utils/responseWrapper");
const User = require("../models/User");

const verifyUser = async (req, res, next) => {
    if (
        !req.headers ||
        !req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer")
    ) {
        return res.send(error(401, "Authorization header are required"));
        // return res.status(401).send("Authorization header are required");
    }

    const accessToken = req.headers.authorization.split(" ")[1];
    try {
        const decode = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_PRIVATE_KEY
        );
        req._id = decode._id;
        const user = await User.findById(req._id);
        if (!user) {
            return res.send(error(404, "User not Found"));
        }
        next();
    } catch (e) {
        return res.send(error(401, "Invalid Access Token"));
        // return res.status(401).send("Invalid Access Token");
    }
};

module.exports = verifyUser;
