const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

const keys = require('./keys');

passport.use(
  new GoogleStrategy({
    //options for the strat
    callbackURL: '/auth/google/callback',
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret
  }, () => {
    //callback fxn
  })
);
