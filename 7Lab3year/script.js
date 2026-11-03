
const form = document.getElementById('paintingForm');
const list = document.getElementById('paintingsList');
const search = document.getElementById('search');
const paintingId = document.getElementById('paintingId');
const artist = document.getElementById('artist');
const title = document.getElementById('title');
const year = document.getElementById('year');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');

let paintings = [];

async function loadPaintings() {
    const response = await fetch('/api/paintings');
    paintings = await response.json();
    showPaintings();
}

function showPaintings() {
    const query = search.value.toLowerCase().trim();

    const filtered = paintings.filter(p =>
        p.artist.toLowerCase().includes(query) ||
        p.title.toLowerCase().includes(query)
    );

    list.replaceChildren();

    if (filtered.length === 0) {
        list.textContent = 'Картин не знайдено';
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'painting';

        const heading = document.createElement('h3');
        heading.textContent = p.title;

        const artistText = document.createElement('p');
        artistText.textContent = 'Автор: ' + p.artist;

        const yearText = document.createElement('p');
        yearText.textContent = 'Рік: ' + p.year;

        const actions = document.createElement('div');
        actions.className = 'actions';

        const editButton = document.createElement('button');
        editButton.textContent = 'Редагувати';
        editButton.addEventListener('click', () => editPainting(p));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Видалити';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', () => deletePainting(p.id));

        actions.append(editButton, deleteButton);
        card.append(heading, artistText, yearText, actions);
        list.append(card);
    });
}
form.addEventListener('submit', async event => {
    event.preventDefault();

    const id = paintingId.value;

    const data = {
        artist: artist.value.trim(),
        title: title.value.trim(),
        year: Number(year.value)
    };

    const url = id
        ? `/api/paintings/${id}`
        : '/api/paintings';

    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
        alert(result.message);
        return;
    }

    form.reset();
    paintingId.value = '';
    saveButton.textContent = 'Додати картину';
    cancelButton.hidden = true;

    await loadPaintings();
});

function editPainting(p) {
    paintingId.value = p.id;
    artist.value = p.artist;
    title.value = p.title;
    year.value = p.year;

    saveButton.textContent = 'Зберегти зміни';
    cancelButton.hidden = false;

    form.scrollIntoView({ behavior: 'smooth' });
}

async function deletePainting(id) {
    if (!confirm('Ви справді хочете видалити картину?')) {
        return;
    }

    const response = await fetch(`/api/paintings/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        alert('Не вдалося видалити картину');
        return;
    }

    await loadPaintings();
}

cancelButton.addEventListener('click', () => {
    form.reset();
    paintingId.value = '';
    saveButton.textContent = 'Додати картину';
    cancelButton.hidden = true;
});

search.addEventListener('input', showPaintings);

loadPaintings().catch(() => {
    list.textContent = 'Помилка з’єднання із сервером';
});
