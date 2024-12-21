import express from "express";
const router = express.Router();
import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const SALT_LENGTH = 12;
router.post("/signup", async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }
    // 如果不是管理员，角色只能是 'customer'
    let userRole = role || "customer";
    if (userRole !== "customer" && userRole !== "admin") {
      return res
        .status(400)
        .json({ error: "Role must be either 'customer' or 'admin'" });
    }
    // 如果是管理员创建用户，并且尝试设置角色为 admin，则允许
    if (userRole === "admin" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden: Only admin can create an admin" });
    }
    const hashedPassword = bcrypt.hashSync(password, SALT_LENGTH);
    const newUser = await User.create({
      username,
      hashedPassword,
      role: userRole,
    });

    const token = jwt.sign(
      { username: newUser.username, _id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/signin", async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && bcrypt.compareSync(req.body.password, user.hashedPassword)) {
      const token = jwt.sign(
        { username: user.username, _id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.status(200).json({ data: { user, token } });
    } else {
      res.status(401).json({ error: "Invalid username or password." });
    }
  } catch (error) {
    error.status = 400;
    error.errorCode = "BAD_REQUEST";
    next(error);
  }
});

export default router;
