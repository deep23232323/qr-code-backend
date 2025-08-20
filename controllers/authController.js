const User = require("../models/user");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerifiedverified: false,
    });

    const token = generateToken(user._id);
    const verifyLink = `${process.env.CLIENT_URL}/api/auth/verify?token=${token}`;
    const html = `
      <h2>Email Verification</h2>
      <p>Hi ${name},</p>
      <p>Click the link below to verify your email:</p>
      <a href="${verifyLink}" target="_blank" style="color: white; background: green; padding: 10px 15px; text-decoration: none;">Verify Email</a>
    `;

    try {
      await sendEmail(email, "Verify Your Email", html);
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr.message);
    }


    res
      .status(201)
      .json({ message: "Signup successful. Please verify your email." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};


exports.verifyEmail = async (req, res) => {
  const token = req.query.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).send("User not found");
    user.isVerified = true;
    await user.save();
    res.status(200).json({ message: "Email verified successfully! Now you can login " });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
   
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);


    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // use true in production
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
