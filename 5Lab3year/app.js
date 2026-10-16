const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.get('/time', (req, res) => {
  const date = new Date().toLocaleDateString('uk-UA');
  const time = new Date().toLocaleTimeString('uk-UA');

  fs.appendFileSync('log.txt', `[${date}, ${time}] ${req.url}\n`);
  res.send(`Поточний час: ${date}, ${time}`);
});

app.get('/time/json', (req, res) => {
  const date = new Date().toLocaleDateString('uk-UA');
  const time = new Date().toLocaleTimeString('uk-UA');

  res.json({ date, time });
});

app.post('/settime', (req, res) => {
  const userValue = req.body.userDate.replace('T', ' ');

  fs.appendFileSync('custom.txt', `${userValue}\n`);
  res.send('<h2>Збережено у custom.txt</h2><a href="/">Назад</a>');
});

app.listen(3000, () => {
  console.log('Сервер запущено на http://localhost:3000');
});
