const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const date = new Date().toLocaleDateString('uk-UA');
  const time = new Date().toLocaleTimeString('uk-UA');

  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Основна сторінка</h1>');

  } else if (req.url === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Приклад сторінки "/about"</h1><p>У місяці, який починається з неділі, обов’язково буде п’ятниця 13-е.</p>');

  } else if (req.url === '/time') {
    fs.appendFileSync('log.txt', `[${date}, ${time}] ${req.url}\n`);
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Поточний час: ${date}, ${time}`);

  } else if (req.url === '/time/json') {
    fs.appendFileSync('log.txt', `[${date}, ${time}] ${req.url}\n`);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ date, time }, null, 2));

  } else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Сторінку не знайдено</h1>');
  }
});

server.listen(3000, () => {
  console.log('Сервер працює на http://localhost:3000');
});
