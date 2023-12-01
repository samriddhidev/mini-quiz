import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const authenticateToken = async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        console.log("Received token:", token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("Decoded token:", decoded);
        const user = await User.findOne({ _id: decoded.userId, token });
        if (!user) {
          return res.status(401).json({ error: "Invalid token." });
        }
        req.user = user;
        next();
      }
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        console.log("Token expired. Please log in again");
        return res
          .status(401)
          .json({ error: "Token expired. Please log in again" });
      } else {
        console.log("Not Authorized. Please log in again");
        return res
          .status(401)
          .json({ error: "Not Authorized. Please log in again" });
      }
    }
  } else {
    console.log("There is no token attached to the header");
    return res
      .status(401)
      .json({ error: "Access denied. Token not provided." });
  }
};

export const registerController = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    let user = null;
    user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    user = new User({
      name,
      email,
      password: hashPassword,
    });
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "User successfully created." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

export const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );
    user.token = token;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Successfully Logged In",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to login" });
  }
};
