const userForm = document.getElementById('userForm');
const usersList = document.getElementById('usersList');
const userId = document.getElementById('userId');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const roleInput = document.getElementById('role');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');
const message = document.getElementById('message');

async function loadUsers() {
    try {
        const response = await fetch('/api/users');

        if (!response.ok) {
            throw new Error('Не вдалося отримати користувачів');
        }

        const users = await response.json();

        usersList.replaceChildren();

        users.forEach(user => {
            const row = document.createElement('tr');

            [
                user.id,
                user.name,
                user.email,
                user.role === 'admin' ? 'Адміністратор' : 'Користувач'
            ].forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actions = document.createElement('td');
            actions.className = 'actions';

            const editButton = document.createElement('button');
            editButton.textContent = 'Редагувати';
            editButton.onclick = () => editUser(user);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Видалити';
            deleteButton.onclick = () => deleteUser(user.id);

            actions.append(editButton, deleteButton);
            row.appendChild(actions);
            usersList.appendChild(row);
        });

        message.textContent = '';
    } catch (error) {
        message.textContent = error.message;
    }
}

userForm.addEventListener('submit', async event => {
    event.preventDefault();

    const id = userId.value;

    const user = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        role: roleInput.value
    };

    if (!user.name || !user.email || !user.role) {
        message.textContent = 'Заповніть усі поля';
        return;
    }

    const url = id ? `/api/users/${id}` : '/api/users';
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Сталася помилка');
        }

        resetForm();
        await loadUsers();

        message.textContent = id
            ? 'Дані користувача оновлено'
            : 'Користувача додано';
    } catch (error) {
        message.textContent = error.message;
    }
});

function editUser(user) {
    userId.value = user.id;
    nameInput.value = user.name;
    emailInput.value = user.email;
    roleInput.value = user.role;

    saveButton.textContent = 'Зберегти зміни';
    cancelButton.hidden = false;
}

async function deleteUser(id) {
    if (!confirm('Ви дійсно хочете видалити користувача?')) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Не вдалося видалити користувача');
        }

        await loadUsers();
        message.textContent = data.message;
    } catch (error) {
        message.textContent = error.message;
    }
}

function resetForm() {
    userForm.reset();
    userId.value = '';
    saveButton.textContent = 'Додати користувача';
    cancelButton.hidden = true;
}

cancelButton.addEventListener('click', resetForm);

loadUsers();
