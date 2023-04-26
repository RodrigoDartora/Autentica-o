const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const app = express();

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'mySecret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Mock users
const users = [
  {
    id: 1,
    email: 'teste@email.com',
    password: '$2b$10$YUMa.BM8..Q./dElyd0SIe3XYZMcMHXSHf00fAPegShMpODRMPclS',
  },
];

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    const user = users.find((user) => user.email === email);
    if (!user) {
      return done(null, false, { message: 'Usuário não encontrado' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Senha incorreta' });
      }
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find((user) => user.id === id);
  done(null, user);
});

app.get('/', (req, res) => {
  res.render('index', { message: req.flash('error') });
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true,
  })
);

app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('dashboard');
  } else {
    res.redirect('/');
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

