const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const resendEmail = require("../controllers/resendEmail");
const User = require("../models/user"); // ✅ Import User model

// Auth Routes
router.post('/signup', authController.signup);
router.get('/verify', authController.verifyEmail);
router.post('/user/login', authController.loginUser);
router.post("/user/email/resend-verification", resendEmail.resendVerification);

// User Deletion by Email


module.exports = router;
