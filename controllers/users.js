import express from "express";
const router = express.Router();
import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const SALT_LENGTH = 12;
\
router.post("/signup", async (req, res) => {
  try {
  const { username, password, role } = req.body;
    // Check if the username is already taken
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.json({ error: "Username already taken." });

router.post("/signup", async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    // Check if the username is already taken
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.json({ error: "Username already taken" });

    }
    // Create a new user with hashed password
    const user = await User.create({
      username,
      hashedPassword: bcrypt.hashSync(password, SALT_LENGTH),

      role:role ||"guest"         //new add
    });
    const token = jwt.sign(
      { username: user.username, _id: user._id },
      process.env.JWT_SECRET
    );
    res.status(201).json({ user, token });
  } catch (error) {
    console.log(111);
    res.status(400).json({
      message: error.message,
      data: {},
      status: 405,
    });
  }
});



      role: role,
    });
    const token = jwt.sign(
      { username: user.username, _id: user._id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({ user, token });
  } catch (error) {
    error.status = 400;
    error.errorCode = "BAD_REQUEST";
    next(error);
  }
});


router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && bcrypt.compareSync(req.body.password, user.hashedPassword)) {
      const token = jwt.sign(

        { username: user.username, _id: user._id },
        process.env.JWT_SECRET
      );
      res.status(200).json({ token });

        { username: user.username, _id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.status(200).json({data:{user,token}});

    } else {
      res.status(401).json({ error: "Invalid username or password." });
    }

    res.status(400).json({ error: error.message });

    error.status = 400;
    error.errorCode = "BAD_REQUEST";
    next(error);

  }
});

export default router;
