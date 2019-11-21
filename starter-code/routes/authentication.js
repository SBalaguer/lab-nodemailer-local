const { Router } = require('express');
const router = new Router();

const User = require('./../models/user');
const bcryptjs = require('bcryptjs');

const generateId = length => {
  const characters =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += characters[Math.floor(Math.random() * characters.length)];
  }
  return token;
};

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

const nodemailer = require('nodemailer');

const EMAIL = 'santi.ironhack.test@gmail.com';
const PASSWORD = 's@anti1234';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: EMAIL,
    pass: PASSWORD
  }
});

router.post('/sign-up', (req, res, next) => {
  
  const token = generateId(14);

  const { name, email, password } = req.body;
  bcryptjs
    .hash(password, 10)
    .then(hash => {
      return User.create({
        name,
        email,
        passwordHash: hash,
        status: 'Pending Confirmation',
        confirmationCode: token
      });
    })
    .then(user => {
      req.session.user = user._id;
      res.redirect('/');
    })
    .then(
      transporter.sendMail({
      from: `IH Test <${EMAIL}>`,
      to: req.body.email,
      subject: 'Test email',
      //text: 'This should be the body of the text email'
      html: `
        <style>
          h1 {
            /* color: green !important; */
          }
        </style>
        <h1 style="color: green">This should be the body of the text email</h1>
        <p><strong>Hello</strong> <em>World!</em></p>
      `
    }))
    .catch(error => {
      next(error);
    })
});

router.get('/sign-in', (req, res, next) => {
  res.render('sign-in');
});

router.post('/sign-in', (req, res, next) => {
  let userId;
  const { email, password } = req.body;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        userId = user._id;
        return bcryptjs.compare(password, user.passwordHash);
      }
    })
    .then(result => {
      if (result) {
        req.session.user = userId;
        res.redirect('/');
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch(error => {
      next(error);
    });
});

router.post('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

const routeGuard = require('./../middleware/route-guard');

router.get('/private', routeGuard, (req, res, next) => {
  res.render('private');
});

module.exports = router;
