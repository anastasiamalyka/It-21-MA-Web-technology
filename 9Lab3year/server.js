const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const fs = require('fs/promises');
const { body, validationResult } = require('express-validator');

const app = express();
const USERS_FILE = 'users.json';

async function readUsers() {
  const data = await fs.readFile(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'my-super-secret-key-2025-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.errors = req.flash('error');
  res.locals.old = req.session.old || {};
  delete req.session.old;
  next();
});

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash('error', 'Увійдіть в систему');
    res.redirect('/login');
  }
};

const isNotAuthenticated = (req, res, next) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    next();
  }
};

const registerValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('ПІБ має бути від 3 до 30 символів'),
  body('email')
    .trim()
    .isEmail().withMessage('Невірний email')
    .custom(async value => {
      const users = await readUsers();
      if (users.find(u => u.email === value)) {
        throw new Error('Цей email вже зареєстровано');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 6 }).withMessage('Пароль має бути ≥ 6 символів'),
  body('passwordConfirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Паролі не збігаються')
];

const loginValidation = [
  body('email')
    .trim()
    .custom(async (value, { req }) => {
      const users = await readUsers();
      const user = users.find(u => u.email === value);
      if (!user) {
        throw new Error('Користувача з таким email не існує');
      }
      req.foundUser = user; 
      return true;
    }),
  body('password')
    .custom(async (value, { req }) => {
      if (!req.foundUser) return true;
      const ok = await bcrypt.compare(value, req.foundUser.password);
      if (!ok) {
        throw new Error('Невірний пароль');
      }
      return true;
    })
];

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/register', isNotAuthenticated, (req, res) => {
  res.render('register');
});

app.post('/register', isNotAuthenticated, registerValidation, async (req, res) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    result.array().forEach(err => req.flash('error', err.msg));
    req.session.old = { fullName: req.body.fullName, email: req.body.email };
    return res.redirect('/register');
  }

  const { fullName, email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);

  const users = await readUsers();
  const newUser = { id: Date.now(), fullName, email, password: hash };
  users.push(newUser);
  await writeUsers(users);

  req.session.user = { id: newUser.id, email: newUser.email, fullName: newUser.fullName };
  res.redirect('/dashboard');
});

app.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login');
});

app.post('/login', isNotAuthenticated, loginValidation, (req, res) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    result.array().forEach(err => req.flash('error', err.msg));
    req.session.old = { email: req.body.email };
    return res.redirect('/login');
  }

  const user = req.foundUser;
  req.session.user = { id: user.id, email: user.email, fullName: user.fullName };
  res.redirect('/dashboard');
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.listen(3000, () => {
  console.log('Сервер запущено: http://localhost:3000');
});
