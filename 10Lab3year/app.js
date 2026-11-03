async function api(url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

function showMessage(text, isError = true) {
  const el = document.getElementById('message');
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? '#c0392b' : '#27ae60';
}

function errorText(data) {
  if (data.errors) return data.errors.map(e => e.msg).join('. ');
  return 'Сталася помилка';
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(registerForm);
    const r = await api('/api/register', 'POST', {
      name: f.get('name'), email: f.get('email'), password: f.get('password')
    });
    if (r.ok) window.location = '/dashboard.html';
    else showMessage(errorText(r.data));
  });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(loginForm);
    const r = await api('/api/login', 'POST', {
      email: f.get('email'), password: f.get('password')
    });
    if (r.ok) window.location = '/dashboard.html';
    else showMessage(errorText(r.data));
  });
}
const taskList = document.getElementById('taskList');
if (taskList) {
  let tasks = [];
  let currentFilter = 'all';
  let chart = null;

  const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();

  async function init() {
    const me = await api('/api/me');
    if (!me.ok) {
      window.location = '/login.html';
      return;
    }
    document.getElementById('greeting').textContent = `Вітаємо, ${me.data.name}!`;
    await loadTasks();
  }

  async function loadTasks() {
    const r = await api('/api/tasks');
    tasks = r.data;
    render();
  }

  function render() {
    let list = tasks;
    if (currentFilter === 'done') list = tasks.filter(t => t.completed);
    if (currentFilter === 'active') list = tasks.filter(t => !t.completed);
    if (currentFilter === 'today') list = tasks.filter(t => isToday(t.createdAt));

    taskList.innerHTML = '';
    if (list.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'Завдань поки немає 🌱';
      taskList.appendChild(empty);
    }

    list.forEach(t => {
      const li = document.createElement('li');
      if (t.completed) li.classList.add('done');

      const title = document.createElement('span');
      title.className = 'title';
      title.textContent = t.title; 
      const badge = document.createElement('span');
      badge.className = 'badge ' + t.priority;
      badge.textContent = t.priority;

      const doneBtn = document.createElement('button');
      doneBtn.textContent = t.completed ? '↩' : '✔';
      doneBtn.onclick = () => updateTask(t.id, { completed: !t.completed });

      const editBtn = document.createElement('button');
      editBtn.textContent = '✏';
      editBtn.onclick = () => {
        const newTitle = prompt('Нова назва завдання:', t.title);
        if (newTitle !== null) updateTask(t.id, { title: newTitle });
      };

      const delBtn = document.createElement('button');
      delBtn.textContent = '🗑';
      delBtn.onclick = () => deleteTask(t.id);

      li.append(title, badge, doneBtn, editBtn, delBtn);
      taskList.appendChild(li);
    });

    updateChart();
  }

  async function updateTask(id, changes) {
    const r = await api('/api/tasks/' + id, 'PUT', changes);
    if (r.ok) {
      showMessage('Завдання оновлено ✅', false);
      loadTasks();
    } else showMessage(errorText(r.data));
  }

  async function deleteTask(id) {
    const r = await api('/api/tasks/' + id, 'DELETE');
    if (r.ok) {
      showMessage('Завдання видалено 🗑', false);
      loadTasks();
    } else showMessage(errorText(r.data));
  }

  document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitle');
    const priority = document.getElementById('taskPriority');
    const r = await api('/api/tasks', 'POST', { title: title.value, priority: priority.value });
    if (r.ok) {
      title.value = '';
      showMessage('Нове завдання додано 🎉', false);
      loadTasks();
    } else showMessage(errorText(r.data));
  });

  document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  function updateChart() {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const data = [completed, total - completed];

    if (chart) {
      chart.data.datasets[0].data = data;
      chart.update();
    } else {
      chart = new Chart(document.getElementById('statsChart'), {
        type: 'doughnut',
        data: {
          labels: ['Виконано', 'Не виконано'],
          datasets: [{ data, backgroundColor: ['#78866B', '#702963'] }]
        }
      });
    }
  }

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    const r = await api('/api/logout');
    window.location = r.data.redirect;
  });

  init();
}
