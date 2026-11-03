const express = require('express');
const fs = require('fs');
const { body, validationResult } = require('express-validator');

const app = express();

app.set('view engine', 'ejs');

// Парсинг даних з HTML-форми
app.use(express.urlencoded({ extended: true }));

// Middleware для логування запитів
function logger(req, res, next) {
  console.log(`Запит: ${req.method} ${req.url}`);
  next();
}
app.use(logger);

// Middleware валідації
const validatePost = [
  body('title')
    .trim()
    .notEmpty().withMessage('Назва обов’язкова')
    .isLength({ min: 3, max: 50 }).withMessage('Назва має бути від 3 до 50 символів')
    .escape(),

  body('content')
    .trim()
    .notEmpty().withMessage('Текст поста обов’язковий')
    .isLength({ max: 1000 }).withMessage('Текст має бути до 1000 символів')
    .escape(),

  body('tags')
    .trim()
    .escape()
    .custom((value) => {
      if (!value) return true; // теги необов’язкові
      const tags = value.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
      if (tags.length > 5) {
        throw new Error('Не більше 5 тегів');
      }
      if (new Set(tags).size !== tags.length) {
        throw new Error('Теги не повинні повторюватись');
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('add-post', {
        errors: errors.array(),
        old: req.body
      });
    }
    next();
  }
];

// Збереження поста у data.json
function createPostHandler(req, res) {
  const posts = JSON.parse(fs.readFileSync('data.json', 'utf8'));

  const post = {
    id: Date.now(),
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags
      ? req.body.tags.split(',').map(t => t.trim()).filter(t => t)
      : [],
    published: req.body.published === 'on' // checkbox надсилає "on", якщо відмічений
  };

  posts.push(post);
  fs.writeFileSync('data.json', JSON.stringify(posts, null, 2));

  res.send('Пост збережено! <a href="/">Додати ще</a>');
}

// Маршрути
app.get('/', (req, res) => {
  res.render('add-post', { errors: [], old: {} });
});

app.post('/posts', validatePost, createPostHandler);

app.listen(3000, () => console.log('Сервер: http://localhost:3000'));
