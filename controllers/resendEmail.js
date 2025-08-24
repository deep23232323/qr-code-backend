const jwt = require("jsonwebtoken");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

exports.resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    // Generate new token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const verifyLink = `${process.env.CLIENT_URL}/api/auth/verify?token=${token}`;
    const html = `<p>Please click the link to verify your email:</p><a href="${verifyLink}">click me</a>`;

    await sendEmail(user.email, "Verify Your Email", html);

    res.status(200).json({ message: "Verification email resent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
