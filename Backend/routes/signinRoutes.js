import express from "express";
import bcrypt from "bcrypt";
import User from "../Model/userScheme.js";
import {
  createAuthToken,
  requireAuth
} from "../utils/auth.js";

const router = express.Router();

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = createAuthToken(user);

    res.status(200).json({
      success: true,
      message: "Signin successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Signin error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user.sub,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

export default router;
