const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Google auth entry point
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));


router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "https://qr-code-backend-b5c4.onrender.com/api/auth/user/login", session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

 const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,                   // ✅ must be true on Render
      sameSite: isProduction ? "none" : "lax", // ✅ allow cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:5173/"); // Redirect to frontend
  }
);

module.exports = router;
