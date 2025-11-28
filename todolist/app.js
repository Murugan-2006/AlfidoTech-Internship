// Simple To-Do with localStorage
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const countLabel = document.getElementById('count');
const clearCompletedBtn = document.getElementById('clear-completed');
const clearAllBtn = document.getElementById('clear-all');

const STORAGE_KEY = 'todo.tasks';

let tasks = loadTasks();
render();

// --- Event listeners ---
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = '';
  input.focus();
});

list.addEventListener('click', e => {
  const li = e.target.closest('li');
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.classList.contains('remove')) {
    removeTask(id);
  } else if (e.target.classList.contains('checkbox')) {
    toggleComplete(id);
  }
});

clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  saveAndRender();
});

clearAllBtn.addEventListener('click', () => {
  if (!confirm('Delete ALL tasks?')) return;
  tasks = [];
  saveAndRender();
});

// keyboard short: Enter is handled by form submit

// --- Functions ---
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Could not parse tasks', e);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function saveAndRender() {
  saveTasks();
  render();
}

function addTask(text) {
  const task = { id: Date.now().toString(), text, done: false };
  tasks.unshift(task); // newest on top
  saveAndRender();
}

function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveAndRender();
}

function toggleComplete(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveAndRender();
}

function render() {
  list.innerHTML = '';
  if (tasks.length === 0) {
    list.innerHTML = `<li class="task-item" style="justify-content:center;color:var(--muted)">No tasks yet — add one!</li>`;
    updateCount();
    return;
  }

  for (const t of tasks) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = t.id;

    li.innerHTML = `
      <div class="task-left">
        <button class="checkbox ${t.done ? 'checked' : ''}" aria-pressed="${t.done}" title="${t.done ? 'Mark as not done' : 'Mark as done'}">
          ${t.done ? '✓' : ''}
        </button>
        <div class="task-text ${t.done ? 'completed' : ''}">${escapeHtml(t.text)}</div>
      </div>
      <div class="task-actions">
        <button class="btn-icon remove" title="Delete task" aria-label="Delete task">🗑️</button>
      </div>
    `;

    list.appendChild(li);
  }

  updateCount();
}

function updateCount() {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  countLabel.textContent = `${total} task${total !== 1 ? 's' : ''} • ${done} done`;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}
