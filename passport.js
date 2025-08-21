require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
callbackURL: "https://qr-code-backend-b5c4.onrender.com/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // First, check if email already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // If user exists, just add googleId if it's not already present
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Otherwise, create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password:"google-auth",
          isVerified: true,
          googleId: profile.id,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user.id); // store user id in session
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
