import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const GOOGLE_CLIENT_ID: string = `${process.env.GOOGLE_CLIENT_ID}`;
const GOOGLE_CLIENT_SECRET: string = `${process.env.GOOGLE_CLIENT_SECRET}`;

// Configure Passport

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/auth/google/callback", // Adjust this URL based on your setup
        },
        (accessToken, refreshToken, profile, done) => {
            // Handle user creation or retrieval logic here
            console.log(profile);
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj: any, done) => {
    done(null, obj);
});

export default passport;
