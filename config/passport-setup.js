// Import the 'passport' library, which is used for user authentication
const passport = require('passport');

// Import the Google OAuth 2.0 strategy from the 'passport-google-oauth20' package
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../models/user')

// Serialize the user object into a format that can be stored in the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize the user object from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    const newUser = {
        googleId: profile.id,
        name: profile.displayName,
        image: profile.photos[0].value,
        email: profile.emails[0].value
    };

    try {
        let user = await User.findOne({ googleId: profile.id }).exec();

        if (user) {
            done(null, user);
        } else {
            // Check if the email already exists in the database
            const emailExisted = await User.findOne({ email: newUser.email }).exec();
            if (emailExisted) {
                // Update the existing user with the Google ID
                emailExisted.googleId = newUser.googleId;
                emailExisted.image = newUser.image
                await emailExisted.save();
                
                done(null, emailExisted);
            } else {
                // Create a new user
                user = await User.create(newUser);
                done(null, user);
            }
        }
    } catch (err) {
        done(err, null);
    }
}));
