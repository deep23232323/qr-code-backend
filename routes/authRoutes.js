const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const resendEmail = require("../controllers/resendEmail");
router.post('/signup', authController.signup);
router.get('/verify', authController.verifyEmail);
router.post('/user/login', authController.loginUser)
router.post("/user/email/resend-verification",resendEmail.resendVerification)


module.exports = router;
