// routes/index.js

const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const { readData, writeData } = require('../filestorage');

const users = readData();

router.get('/', (req, res) => {
  res.render('index', { message: req.flash('error'), success: req.flash('success')[0] });
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true,
  })
);

router.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('dashboard');
  } else {
    res.redirect('/');
  }
});

router.get('/signup', (req, res) => {
  res.render('signup', { message: req.flash('error') });
});

router.get('/logout', (req, res) => {
  const successMessage = 'Você saiu da sua conta';
  req.session.destroy(err => {
    if (err) {
      console.log(err);
      return res.redirect('/dashboard');
    }
    res.render('index', { message: null, success: successMessage });
  });
});

router.post('/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      id: Date.now(),
      email: req.body.email,
      password: hashedPassword,
    };
    users.push(user);
    writeData(users);
    res.redirect('/');
  } catch (err) {
    req.flash('error', 'Ocorreu um erro ao tentar criar a conta');
    res.redirect('/signup');
  }
});

module.exports = router;

