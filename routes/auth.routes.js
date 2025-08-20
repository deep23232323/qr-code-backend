const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Google auth entry point
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback handler
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5000/api/auth/user/login", session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax",
      secure: false, // true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:5173/"); // Redirect to frontend
  }
);

module.exports = router;
