const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { read, write } = require('./utils/db');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'todo-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false } 
}));
app.use(flash());

const isAuthenticated = (req, res, next) => {
  if (req.session.user) next();
  else res.status(401).json({ redirect: '/login.html' });
};

const registerValidation = [
  body('name').trim().isLength({ min: 3 }).withMessage('Введіть ПІБ (мінімум 3 символи)'),
  body('email').trim().isEmail().withMessage('Некоректний email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль має містити мінімум 6 символів')
];

const taskValidation = [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Назва: від 1 до 100 символів'),
  body('priority').optional().isIn(['низька', 'середня', 'висока']).withMessage('Некоректний пріоритет')
];

app.post('/api/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  const users = read('users.json');

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ errors: [{ msg: 'Такий email уже зареєстровано' }] });
  }

  const hash = await bcrypt.hash(password, 12);
  const user = {
    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    email,
    password: hash
  };
  users.push(user);
  write('users.json', users);

  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.json({ success: true });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = read('users.json').find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ errors: [{ msg: 'Невірний email або пароль' }] });
  }

  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.json({ success: true });
});

app.get('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ redirect: '/login.html' }));
});

app.get('/api/me', isAuthenticated, (req, res) => {
  res.json(req.session.user);
});

app.use('/api/tasks', isAuthenticated);

app.get('/api/tasks', (req, res) => {
  const tasks = read('tasks.json').filter(t => t.userId === req.session.user.id);
  res.json(tasks);
});

app.post('/api/tasks', taskValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const tasks = read('tasks.json');
  const task = {
    id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    userId: req.session.user.id,
    title: req.body.title,
    completed: false,
    createdAt: new Date().toISOString(),
    priority: req.body.priority || 'середня'
  };
  tasks.push(task);
  write('tasks.json', tasks);
  res.json(task);
});

app.put('/api/tasks/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Назва: від 1 до 100 символів'),
  body('priority').optional().isIn(['низька', 'середня', 'висока']).withMessage('Некоректний пріоритет')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const tasks = read('tasks.json');
  const task = tasks.find(t => t.id === Number(req.params.id) && t.userId === req.session.user.id);
  if (!task) return res.status(404).json({ errors: [{ msg: 'Завдання не знайдено' }] });

  if (req.body.title !== undefined) task.title = req.body.title;
  if (req.body.completed !== undefined) task.completed = req.body.completed;
  if (req.body.priority !== undefined) task.priority = req.body.priority;

  write('tasks.json', tasks);
  res.json({ success: true });
});

app.delete('/api/tasks/:id', (req, res) => {
  const tasks = read('tasks.json');
  const index = tasks.findIndex(t => t.id === Number(req.params.id) && t.userId === req.session.user.id);
  if (index === -1) return res.status(404).json({ errors: [{ msg: 'Завдання не знайдено' }] });

  tasks.splice(index, 1);
  write('tasks.json', tasks);
  res.json({ success: true });
});

app.listen(3000, () => console.log('Сервер: http://localhost:3000'));
