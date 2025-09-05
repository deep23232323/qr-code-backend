const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const resetRoute = require("./routes/resetAuth");
const cors = require('cors');
const passport = require("passport");
const session = require("express-session");
const jwt  = require("jsonwebtoken");
require("./passport"); // ← import config
const authRoutes2 = require("./routes/auth.routes");
const qrRoutes = require("./routes/qrRoute");
const path = require("path");
const hbs = require('hbs');


hbs.registerHelper('json', function (context) {
  return JSON.stringify(context);
});
const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",                 // Vite dev
    "https://qr-code-frontend-sandy.vercel.app" // Your deployed frontend
  ],
  credentials: true  // allow cookies / auth headers
}));git add .
git commit -m "update backend CORS + Google Auth URL"
git push origin main

app.set('view engine', 'hbs');

dotenv.config();
connectDB();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.set('views', path.join(__dirname, 'views'));


app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes2);
app.use('/api/auth', authRoutes);
app.use("/auth",resetRoute);
app.use("/api/qr", qrRoutes);

app.get("/api/user/profile", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
    res.json({ id: decoded.id });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
