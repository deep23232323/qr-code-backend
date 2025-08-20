const User = require('../models/user');
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt")

exports.requestReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  user.resetToken = code;
  user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // valid for 10 minutes
try {
  await user.save();
  console.log("User saved:", user);
} catch (err) {
  console.error("Error saving user:", err);
}
  const html = `
        <h2>Password Reset</h2>
        <p>Hi</p>
        <p>you OTP to reset your password is:${code}</p>
        <h1="${user.resetCode}" target="_blank" style="color: white; background: green; padding: 10px 15px; text-decoration: none;"></h1>
      `;
  
      try {
        await sendEmail(email, "OTP for password update", html);
      } catch (emailErr) {
        console.error("Email sending failed:", emailErr.message);
      }
 

  // For now, just log it to simulate email
  console.log(`Reset code for ${email}: ${code}`);

  res.json({ message: 'Reset code sent to your email.' });
};


// controllers/authController.js


exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // 1. Check if all fields are provided
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 2. Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Check if code matches and is not expired
    if (
      user.resetToken !== code ||
      !user.resetTokenExpiry ||
      user.resetTokenExpiry < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // 4. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 5. Update password and clear reset fields
    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;

    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
