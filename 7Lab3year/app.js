const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const filePath = path.join(__dirname, 'data', 'paintings.json');

app.use(express.json());  //middleware
app.use(express.static(path.join(__dirname, 'public')));

function readPaintings() {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function savePaintings(paintings) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(paintings, null, 2)
    );
}

app.get('/api/paintings', (req, res) => {
    res.json(readPaintings());
});

app.post('/api/paintings', (req, res) => {
    const { artist, title, year } = req.body;

    if (!artist || !title || !Number.isInteger(year) ||
        year < 1 || year > new Date().getFullYear()) {
        return res.status(400).json({
            message: 'Перевірте правильність введених даних'
        });
    }

    const paintings = readPaintings();

    const newPainting = {
        id: paintings.length
            ? Math.max(...paintings.map(p => p.id)) + 1
            : 1,
        artist,
        title,
        year
    };

    paintings.push(newPainting);
    savePaintings(paintings);

    res.status(201).json(newPainting);
});

app.put('/api/paintings/:id', (req, res) => {
    const paintings = readPaintings();
    const id = Number(req.params.id);

    const painting = paintings.find(p => p.id === id);

    if (!painting) {
        return res.status(404).json({
            message: 'Картину не знайдено'
        });
    }

    const { artist, title, year } = req.body;

    if (!artist || !title || !Number.isInteger(year) ||
        year < 1 || year > new Date().getFullYear()) {
        return res.status(400).json({
            message: 'Перевірте правильність введених даних'
        });
    }

    painting.artist = artist;
    painting.title = title;
    painting.year = year;

    savePaintings(paintings);
    res.json(painting);
});

app.delete('/api/paintings/:id', (req, res) => {
    const paintings = readPaintings();
    const id = Number(req.params.id);

    const index = paintings.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: 'Картину не знайдено'
        });
    }

    paintings.splice(index, 1);
    savePaintings(paintings);

    res.json({ message: 'Картину видалено' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущено: http://localhost:${PORT}`);
});
