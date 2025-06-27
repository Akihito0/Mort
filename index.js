const sideLinks = document.querySelectorAll('.sidebar .side-menu li a:not(.logout)');

sideLinks.forEach(item => {
    const li = item.parentElement;
    item.addEventListener('click', () => {
        sideLinks.forEach(i => {
            i.parentElement.classList.remove('active');
        });
        li.classList.add('active');
    });
});

// Toggle sidebar on mobile
const menuBar = document.querySelector('.content nav .bx.bx-menu');
const sideBar = document.querySelector('.sidebar');

menuBar.addEventListener('click', () => {
    sideBar.classList.toggle('close');
});

// Search behavior on small screens
const searchBtn = document.querySelector('.content nav form .form-input button');
const searchBtnIcon = document.querySelector('.content nav form .form-input button .bx');
const searchForm = document.querySelector('.content nav form');

searchBtn.addEventListener('click', function (e) {
    if (window.innerWidth < 576) {
        e.preventDefault();
        searchForm.classList.toggle('show');
        if (searchForm.classList.contains('show')) {
            searchBtnIcon.classList.replace('bx-search', 'bx-x');
        } else {
            searchBtnIcon.classList.replace('bx-x', 'bx-search');
        }
    }
});

// Handle resize effects
window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
        sideBar.classList.add('close');
    } else {
        sideBar.classList.remove('close');
    }

    if (window.innerWidth > 576) {
        searchBtnIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }
});

// Dark mode toggle
const toggler = document.getElementById('theme-toggle');
toggler.addEventListener('change', function () {
    if (this.checked) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
});

// TO-DO View Toggle
const todoMenu = document.querySelector('#show-todo');
const dashboardView = document.getElementById('dashboard-view');
const todoView = document.getElementById('todo-view');

todoMenu.addEventListener('click', (e) => {
    e.preventDefault();
    dashboardView.classList.add('hidden');
    todoView.classList.remove('hidden');
});

const homeMenu = document.querySelector('.side-menu li a[href="#"]:not(#show-todo):not(.logout)');

homeMenu.addEventListener('click', (e) => {
    e.preventDefault();
    todoView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
});

//start of To-Do List Functionality
let tasks = [];
let editId = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("current-date").textContent = new Date().toLocaleDateString();
  renderTasks();
});

function toggleForm() {
  document.getElementById("task-form").classList.toggle("hidden");
  clearForm();
}

function saveTask() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const status = document.getElementById("status").value;
  const priority = document.getElementById("priority").value;
  const dueDate = document.getElementById("due-date").value;

  if (!title || !description) return alert("Please fill all fields");

 const task = {
  id: editId || Date.now(),
  title,
  description,
  status,
  priority, // newly added kania
  dueDate, // newly added kania
  created: new Date().toLocaleDateString()
};

  if (editId) {
    const index = tasks.findIndex(t => t.id === editId);
    tasks[index] = task;
    editId = null;
  } else {
    tasks.push(task);
  }

  toggleForm();
  renderTasks();
}

function renderTasks() {
  const todoContainer = document.getElementById("todo-tasks");
  const completedContainer = document.getElementById("completed-tasks");
  todoContainer.innerHTML = "";
  completedContainer.innerHTML = "";

  let completed = 0, inProgress = 0, notStarted = 0;

  tasks.forEach(task => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task-row";
    taskDiv.dataset.status = task.status;

    const statusClass = {
      "Completed": "completed",
      "In Progress": "in-progress",
      "Not Started": "not-started"
    }[task.status];

    const priorityClass = {
      "High": "high",
      "Medium": "medium",
      "Low": "low"
    }[task.priority];

    taskDiv.innerHTML = `
      <div>
        <div class="task-title">${task.title}</div>
        <div class="task-date"><strong>Due Date:</strong> ${task.dueDate || "None"}</div>
      </div>
      <div class="task-right">
        <span class="badge status-badge ${statusClass}">${task.status}</span>
        <span class="badge priority-badge ${priorityClass}">${task.priority}</span>
        <div class="actions">
          <button onclick="editTask(${task.id})" title="Edit">✏️</button>
          <button onclick="deleteTask(${task.id})" title="Delete">🗑️</button>
        </div>
      </div>
    `;

    if (task.status === "Completed") {
      completed++;
      completedContainer.appendChild(taskDiv);
    } else {
      if (task.status === "In Progress") inProgress++;
      if (task.status === "Not Started") notStarted++;
      todoContainer.appendChild(taskDiv);
    }
  });

  updateCircularProgress(completed, inProgress, notStarted, tasks.length || 1);
}

function updateCircularProgress(completed, inProgress, notStarted, total) {
  const completedPercent = Math.round((completed / total) * 100);
  const inProgressPercent = Math.round((inProgress / total) * 100);
  const notStartedPercent = Math.round((notStarted / total) * 100);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  const setProgress = (id, percent) => {
    const offset = circumference - (percent / 100) * circumference;
    document.getElementById(id).style.strokeDashoffset = offset;
  };

  setProgress("completed-bar", completedPercent);
  setProgress("progress-bar", inProgressPercent);
  setProgress("notstarted-bar", notStartedPercent);

  document.getElementById("completed-count").textContent = `${completedPercent}%`;
  document.getElementById("progress-count").textContent = `${inProgressPercent}%`;
  document.getElementById("notstarted-count").textContent = `${notStartedPercent}%`;
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description;
  document.getElementById("status").value = task.status;
  document.getElementById("priority").value = task.priority;
  document.getElementById("task-form").classList.remove("hidden");
  document.getElementById("due-date").value = task.dueDate || "";
  editId = id;
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("status").value = "Not Started";
  document.getElementById("priority").value = "Low";
  document.getElementById("due-date").value = "";
  editId = null;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("current-date").textContent = new Date().toLocaleDateString();
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("due-date").setAttribute("min", today); 
  renderTasks();
});
function applyFilters() {
  const priorityFilter = document.getElementById("filter-priority").value;
  const statusFilter = document.getElementById("filter-status").value;
  const dateFilter = document.getElementById("filter-date").value;

  const todoContainer = document.getElementById("todo-tasks");
  todoContainer.innerHTML = "";

  let completed = 0, inProgress = 0, notStarted = 0;

  tasks.forEach(task => {
    if (task.status === "Completed") return;

    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesDate = !dateFilter || task.dueDate === dateFilter;

    if (matchesPriority && matchesStatus && matchesDate) {
      const taskDiv = document.createElement("div");
      taskDiv.className = "task-row";
      taskDiv.dataset.status = task.status;

      const statusClass = {
        "Completed": "completed",
        "In Progress": "in-progress",
        "Not Started": "not-started"
      }[task.status];

      const priorityClass = {
        "High": "high",
        "Medium": "medium",
        "Low": "low"
      }[task.priority];

      taskDiv.innerHTML = `
        <div>
          <div class="task-title">${task.title}</div>
          <div class="task-date"><strong>Due Date:</strong> ${task.dueDate || "None"}</div>
        </div>
        <div class="task-right">
          <span class="badge status-badge ${statusClass}">${task.status}</span>
          <span class="badge priority-badge ${priorityClass}">${task.priority}</span>
          <div class="actions">
            <button onclick="editTask(${task.id})">✏️</button>
            <button onclick="deleteTask(${task.id})">🗑️</button>
          </div>
        </div>
      `;

      if (task.status === "In Progress") inProgress++;
      if (task.status === "Not Started") notStarted++;
      todoContainer.appendChild(taskDiv);
    }
  });

  updateCircularProgress(0, inProgress, notStarted, inProgress + notStarted || 1);
}

function resetFilters() {
  document.getElementById("filter-priority").value = "";
  document.getElementById("filter-status").value = "";
  document.getElementById("filter-date").value = "";
  renderTasks();
}
//end of To-Do List Functionality

//calendar functionality
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function toggleCalendar() {
    const todoView = document.getElementById("todo-view");
    const calendarView = document.getElementById("calendar-view");

    todoView.classList.toggle("hidden");
    calendarView.classList.toggle("hidden");

    if (!calendarView.classList.contains("hidden")) {
        loadCalendarTasks(tasks);
    }
}

function prevMonth() {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear -= 1;
    } else {
        currentMonth -= 1;
    }
    loadCalendarTasks(tasks);
}

function nextMonth() {
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear += 1;
    } else {
        currentMonth += 1;
    }
    loadCalendarTasks(tasks);
}

function generateCalendarGrid() {
    const container = document.getElementById('calendar-scheduled');
    container.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();

    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = date.toISOString().split("T")[0];

        const dayCol = document.createElement("div");
        dayCol.classList.add("calendar-day");
        dayCol.dataset.date = dateStr;
        dayCol.innerHTML = `
            <div class="day-label">${date.toDateString()}</div>
            <div class="drop-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, '${dateStr}')"></div>
        `;
        container.appendChild(dayCol);
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function dragStart(event, taskId) {
    event.dataTransfer.setData("text/plain", taskId);
}

function handleDrop(event, newDate) {
    const taskId = event.dataTransfer.getData("text/plain");
    const today = new Date().toISOString().split("T")[0];
    if (newDate < today) {
        alert("Cannot set task to a past date.");
        return;
    }

    const task = tasks.find(t => t.id == taskId);
    if (task) {
        task.dueDate = newDate;
        renderTasks();
        loadCalendarTasks(tasks);
    }
}

function loadCalendarTasks(tasks = []) {
    generateCalendarGrid();

    const unscheduledContainer = document.getElementById('unscheduled-tasks');
    const calendarMonthEl = document.getElementById('calendar-month');
    unscheduledContainer.innerHTML = '';

    const dateLabel = new Date(currentYear, currentMonth);
    const monthName = dateLabel.toLocaleString('default', { month: 'long' });
    calendarMonthEl.textContent = `${monthName} ${currentYear}`;

    if (tasks.length === 0) {
        unscheduledContainer.innerHTML = '<p>No tasks without due dates.</p>';
        return;
    }

    tasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.classList.add('calendar-task');
        taskEl.draggable = true;
        taskEl.ondragstart = (e) => dragStart(e, task.id);
        taskEl.innerHTML = `<strong>${task.title}</strong><br><small>${task.dueDate || "No due date"}</small>`;

        if (!task.dueDate) {
            unscheduledContainer.appendChild(taskEl);
        } else {
            const targetDay = document.querySelector(`.calendar-day[data-date="${task.dueDate}"] .drop-zone`);
            if (targetDay) {
                targetDay.appendChild(taskEl);
            }
        }
    });
}
//end of calendar functionality