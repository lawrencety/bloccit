const userQueries = require('../db/queries.users.js');
const passport = require('passport');

module.exports = {
  signUp(req, res, next) {
    res.render('users/sign_up');
  },

  create(req, res, next) {
    let newUser = {
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };
    userQueries.createUser(newUser, (err, user) => {
      console.log('CREATED USER');
      if(err) {
        req.flash('error', err);
        res.redirect('/users/sign_up')
      } else {
        passport.authenticate('local')(req, res, () => {
          req.flash('notice', 'You\'ve successfully signed in!');
          res.redirect('/');
        })
      }
    })
  },

  signInForm(req, res, next) {
    res.render('users/sign_in')
  },

  signIn(req, res, next) {
    passport.authenticate('local') (req, res, () => {
      console.log(req.user);
      if(!req.user) {
        console.log('Sign in failed');
        req.flash('notice', 'Sign in failed. Please try again.')
        res.redirect('/users/sign_in');
      } else {
        console.log('success');
        req.flash('notice', 'You\'ve successfully signed in!')
        res.redirect('/')
      }
    })
  },

  signOut(req, res, next) {
    req.logout();
    req.flash('notice', 'You\'ve successfully signed out!');
    res.redirect('/');
  }

}
