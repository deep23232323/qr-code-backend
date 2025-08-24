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
  res.send(`
      <html>
        <head>
          <title>Email Verified</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              background: #f0f4f8;
            }
            .card {
              background: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              text-align: center;
            }
            .card h1 { color: #28a745; }
            .card a {
              display: inline-block;
              margin-top: 20px;
              padding: 10px 20px;
              background: #28a745;
              color: white;
              border-radius: 6px;
              text-decoration: none;
            }
            .card a:hover { background: #218838; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>✅ Email Verified Successfully!</h1>
            <p>You can now log in to your account.</p>
            <a href="http://localhost:5173/login">Go to Login</a>
          </div>
        </body>
      </html>
    `);
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
const isProduction = process.env.NODE_ENV === "production";

res.cookie("token", token, {
  httpOnly: true,
  secure: isProduction,                         // true only in production
  sameSite: isProduction ? "none" : "lax",      // "none" for cross-site in prod, "lax" for localhost
  maxAge: 7 * 24 * 60 * 60 * 1000,              // 7 days
});


    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
