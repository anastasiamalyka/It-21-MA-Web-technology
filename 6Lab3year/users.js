const express = require('express');
const router = express.Router();

let users = [
    { id: 1, name: 'Іван', email: 'ivan@gmail.com', role: 'user' },
    { id: 2, name: 'Марія', email: 'maria@gmail.com', role: 'admin' },
    { id: 3, name: 'Олег', email: 'oleg@gmail.com', role: 'user' }
];

router.get('/', (req, res) => {
    res.json(users);
});

router.get('/:id', (req, res) => {
    const user = users.find(u => u.id === Number(req.params.id));

    if (!user) {
        return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    res.json(user);
});

router.post('/', (req, res) => {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
        return res.status(400).json({
            message: 'Заповніть усі поля'
        });
    }

    const user = {
        id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name,
        email,
        role
    };

    users.push(user);

    res.status(201).json(user);
});

router.put('/:id', (req, res) => {
    const user = users.find(u => u.id === Number(req.params.id));

    if (!user) {
        return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    const { name, email, role } = req.body;

    if (!name || !email || !role) {
        return res.status(400).json({
            message: 'Заповніть усі поля'
        });
    }

    user.name = name;
    user.email = email;
    user.role = role;

    res.json(user);
});

router.delete('/:id', (req, res) => {
    const index = users.findIndex(u => u.id === Number(req.params.id));

    if (index === -1) {
        return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    users.splice(index, 1);

    res.json({ message: 'Користувача видалено' });
});

module.exports = router;
