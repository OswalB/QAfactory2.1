const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');
passport.use(new LocalStrategy({
    usernameField: 'phone',
    passwordField: 'password',

}, async (phone, password, done) => {

    const user = await User.findOne({ phone });
    if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
    } else {
        //match password's user
        const match = await user.matchPassword(password);
        if (match) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Password incorrecto' });
        }
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findOne({ _id: id })
        .exec()
        .then((user) => {
            done(null, user);
        })
        .catch((err) => {
            done(err, null);
        });
});