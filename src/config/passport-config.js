import passport from "passport";
import { Strategy as GooglStrategy } from "passport-google-oauth20";
import { User } from "../models/User.models.js";
import { OAuthError } from "../utils/OAuthError.js";
import config from "../../config/config.js";

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      console.error("Error during deserializeUser:", err);
      done(err);
    });
});

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.use(
  new GooglStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Data is nested in profile._json
      const { _json } = profile;
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(
          null,
          false,
          new OAuthError("EMAIL_NOT_AVAILABLE", "Email not provided by Google")
        );
      }

      // Check by googleId
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }
      // Check by email
      user = await User.findOne({ email });

      if (user) {
        // Email exists but Google not linked
        // OPTION A: auto-link Google
        user.googleId = profile.id;
        user.isVerified = true;
        await user.save();

        return done(null, user);

        // OPTION B (instead): block + UI message
        // return done(
        //   null,
        //   false,
        //   new OAuthError(
        //     "EMAIL_ALREADY_EXISTS",
        //     "Account already exists with this email"
        //   )
        // );
      }

      User.findOne({ googleId: profile.id })
        .then((existingUser) => {
          if (existingUser) {
            done(null, existingUser);
          } else {
            new User({
              googleId: profile.id,
              fullname: profile.displayName,
              displayName: profile.displayName,
              email: profile.emails[0].value,
              profilePic: profile.photos[0].value,
              phone_number: _json.phoneNumbers
                ? _json.phoneNumbers[0].value
                : "",
              dob: _json.birthdays ? new Date(_json.birthdays[0].date) : null,
              gender: _json.gender || "unspecified",
              preferred_language: _json.locale || "English",
              isVerified: true,
              passwordOtpVerify: true,
            })
              .save()
              .then((user) => done(null, user))
              .catch((err) => {
                console.error("Error during user creation:", err);
                done(err);
              });
          }
        })
        .catch((err) => {
          // Safety net for race condition
          if (err.code === 11000) {
            return done(
              null,
              false,
              new OAuthError(
                "EMAIL_ALREADY_EXISTS",
                "Account already exists with this email"
              )
            );
          }
          console.error("Error during user lookup:", err);
          done(err);
        });
    }
  )
);

export default passport;
