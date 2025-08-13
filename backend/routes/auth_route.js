require("dotenv").config();
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import the database connection
const db = require("../db");

// Sign up a new user
router.post("/signup", async (req, res) => {
  const { email, password, company } = req.body;
  if (!email || !password || !company) {
    return res
      .status(400)
      .json({ error: "Email, password, and company are required" });
  }
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const public_key = crypto.randomUUID(); // Generate a unique public key

  try {
    const statement = db.prepare(
      "INSERT INTO users (email, password, company, public_key) VALUES (?, ?, ?, ?)"
    );
    const result = statement.run(email, passwordHash, company, public_key);

    res.status(201).json({
      id: result.lastInsertRowid,
      email,
      company,
    });
    console.log("New user signed up:", {
      id: result.lastInsertRowid,
      email,
      public_key,
      company,
    });
  } catch (error) {
    console.error("Error signing up user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const statement = db.prepare("SELECT * FROM users WHERE email = ?");
    const user = statement.get(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token: token,
    });
    console.log("User logged in:", {
      id: user.id,
      email: user.email,
      company: user.company,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Export the router
module.exports = router;
