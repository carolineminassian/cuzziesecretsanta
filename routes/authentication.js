'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const User = require('./../models/user');

const router = new Router();

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

router.post('/sign-up', (req, res, next) => {
  const { name, gender, email, password } = req.body;
  bcryptjs
    .hash(password, 10)
    .then((hash) => {
      User.findOne({ email }).then((existingEmail) => {
        if (existingEmail) {
          return Promise.reject(new Error('That email already exists.'));
        } else {
          return User.create({
            name,
            gender,
            email,
            passwordHashAndSalt: hash
          })
            .then((user) => {
              req.session.userId = user._id;
              res.redirect('/home');
            })
            .catch((error) => {
              next(error);
            });
        }
      });
    })
    .then((result) => {
      if (result) {
        // req.session.userId = user._id;
        res.redirect('/home');
      } else {
        return Promise.reject(new Error('Email already exists.'));
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/sign-in', (req, res, next) => {
  res.render('sign-in');
});

router.post('/sign-in', (req, res, next) => {
  let user;
  const { email, password } = req.body;
  User.findOne({ email })
    .then((document) => {
      if (!document) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        user = document;
        return bcryptjs.compare(password, user.passwordHashAndSalt);
      }
    })
    .then((result) => {
      if (result) {
        req.session.userId = user._id;
        res.redirect('/home');
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
