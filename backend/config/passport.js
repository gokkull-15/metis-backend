const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AuthUser = require('../models/AuthUser');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await AuthUser.findOne({ 
      $or: [
        { googleId: profile.id },
        { email: profile.emails[0].value }
      ]
    });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId && user.email === profile.emails[0].value) {
        user.googleId = profile.id;
        user.provider = 'google';
        await user.save();
      }
      return done(null, user);
    }

    // Create new user
    user = new AuthUser({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos[0]?.value,
      provider: 'google',
      isVerified: true
    });

    await user.save();
    return done(null, user);

  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await AuthUser.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
