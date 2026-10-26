const express = require('express');
const usersRouter = require('./routes/users');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use('/api/users', usersRouter);

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Сервер запущено: http://localhost:${PORT}`);
});
