const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { success, error } = require("../utils/responseWrapper");

const signupController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            // return res.status(400).send("All fields are required");
            return res.send(error(400, "All fields are required"));
        }

        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.send(error(409, "User already registered"));
            // return res.status(409).send("User already registered");
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        return res.send(success(201, "User created Successfully"));
        // return res.status(201).json(user);
    } catch (e) {
        return res.send(error(400, e.message));
        // res.status(400).send("Something Went Wrong!!!");
    }
};

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.send(error(400, "All fields are required"));
            // return res.status(400).send("All fields are required");
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.send(error(404, "User Not Found!!!"));
            // return res.status(404).send("User Not Found!!!");
        }

        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            return res.send(error(401, "Invalid Credentials!!!"));
            // return res.status(401).send("Invalid Credentials!!!");
        }

        const accessToken = generateAccessToken({ _id: user._id });
        const refreshToken = generateRefreshToken({ _id: user._id });

        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            secure: true,
        });

        res.send(success(200, { accessToken }));
        // res.status(200).send({accessToken});
    } catch (e) {
        // console.log(e);
        return res.send(error(400, e.message));
        // res.status(400).send("Something Went Wrong!!!");
    }
};

// this controller will validate the refresh token and generate a new access token
const refreshAccessTokenController = async (req, res) => {
    // const {refreshToken} = req.body;
    const cookies = req.cookies;

    if (!cookies.jwt) {
        return res.send(error(401, "Refresh token in cookies is required"));
        // return res.status(401).send("refresh token in cookies is required");
    }

    const refreshToken = cookies.jwt;
    // if(!refreshToken){
    //     return res.status(401).send("refresh token is required");
    // }

    try {
        const decode = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_PRIVATE_KEY
        );
        const _id = decode._id;
        const accessToken = generateAccessToken({ _id });
        res.send(success(201, { accessToken }));
        // res.status(201).send({accessToken});
    } catch (e) {
        // console.log(e);
        return res.send(error(401, "Invalid refresh token"));
        // return res.status(401).send("Invalid refresh token");
    }
};

const logoutController = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: true,
        });
        return res.send(success(200, "user logged out"));
    } catch (e) {
        return res.send(error(500, e.message));
    }
};

// Internal Function
const generateAccessToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
            expiresIn: "1d",
        });
        return token;
    } catch (e) {
        // console.log(e);
    }
};

const generateRefreshToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
            expiresIn: "1y",
        });
        return token;
    } catch (e) {
        // console.log(e);
    }
};

module.exports = {
    signupController,
    loginController,
    refreshAccessTokenController,
    logoutController
};
