const express = require('express');
const router = express.Router();
const {requestReset, resetPassword} = require("../controllers/resetEmail");

router.post("/request-reset",requestReset);
router.post("/user/reset-password", resetPassword)

module.exports = router