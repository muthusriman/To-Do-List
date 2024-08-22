const input = document.querySelector("#input");
const add = document.querySelector(".add");
const taskList = document.querySelector(".task-list");
const alert = document.querySelector(".alert");
const noTasksMessage = document.querySelector(".empty");
const statusButtons = document.querySelectorAll(".status-row button");
const taskCounter = document.querySelector("#task-counter");
const tabs = document.querySelectorAll(".status-btn");
const line = document.querySelector(".line");

let todos = [];
let filter = 'all';

window.onload = () => {
  todos = JSON.parse(localStorage.getItem('todos')) || [];
  renderTasks();
  updateLine();
};
window.onresize = updateLine;

function updateLine() {
  const activeTab = document.querySelector('.status-btn.active');
  if (activeTab) {
    line.style.width = `${activeTab.offsetWidth}px`; 
    line.style.left = `${activeTab.offsetLeft}px`; 
  }
}

add.addEventListener('click', addTaskFromInput);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTaskFromInput();
});

function addTaskFromInput() {
  if (input.value.trim() === "") {
    showAlert("Please enter a task before adding!", "red");
  } else {
    const taskName = input.value.trim().substring(0, 150);
    const newTask = { name: taskName, completed: false };
    todos.push(newTask);
    localStorage.setItem('todos', JSON.stringify(todos));
    showAlert("Task added successfully!", "green");
    input.value = "";
    renderTasks();
  }
}

function addTask(task) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span class="task-name ${task.completed ? 'completed' : ''}">${task.name}</span>
    <input type="checkbox" ${task.completed ? 'checked' : ''} id="check-${task.name}">
    <label for="check-${task.name}" class="button"></label>
    <img src="images/edit_icon.png" alt="Edit" class="edit">
    <img src="images/save_icon.png" alt="Save" class="save" style="display:none;">
    <img src="images/remove_icon.png" alt="Remove" class="rem">
  `;

  li.querySelector(".rem").addEventListener('click', () => removeTask(task.name));
  li.querySelector(".edit").addEventListener('click', () => editTask(li, task.name));
  li.querySelector(".save").addEventListener('click', () => saveTask(li, task.name));
  li.querySelector("input[type='checkbox']").addEventListener('change', () => toggleComplete(task.name));

  taskList.appendChild(li);
}

function removeTask(taskName) {
  todos = todos.filter(todo => todo.name !== taskName);
  localStorage.setItem('todos', JSON.stringify(todos));
  showAlert("Task removed successfully!", "green");
  renderTasks();
}

function editTask(li, oldTaskName) {
  const taskIndex = todos.findIndex(todo => todo.name === oldTaskName);
  const currentTask = todos[taskIndex];

  li.innerHTML = `
    <input type="text" class="edit-input" value="${currentTask.name}">
    <input type="checkbox" ${currentTask.completed ? 'checked' : ''} id="check-${currentTask.name}">
    <label for="check-${currentTask.name}" class="button"></label>
    <img src="images/save_icon.png" alt="Save" class="save">
    <img src="images/remove_icon.png" alt="Remove" class="rem">
  `;

  const editInput = li.querySelector(".edit-input");
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);

  li.querySelector(".rem").addEventListener('click', () => removeTask(oldTaskName));
  li.querySelector(".save").addEventListener('click', () => saveTask(li, oldTaskName));
  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveTask(li, oldTaskName);
  });
}

function saveTask(li, oldTaskName) {
  const inputField = li.querySelector(".edit-input");
  const newTaskName = inputField.value.trim().substring(0, 150);

  if (newTaskName === "") {
    showAlert("Task cannot be empty!", "red");
    return;
  }

  const taskIndex = todos.findIndex(todo => todo.name === oldTaskName);
  todos[taskIndex].name = newTaskName;
  localStorage.setItem('todos', JSON.stringify(todos));

  li.innerHTML = `
    <span class="task-name ${todos[taskIndex].completed ? 'completed' : ''}">${newTaskName}</span>
    <input type="checkbox" ${todos[taskIndex].completed ? 'checked' : ''} id="check-${newTaskName}">
    <label for="check-${newTaskName}" class="button"></label>
    <img src="images/edit_icon.png" alt="Edit" class="edit">
    <img src="images/remove_icon.png" alt="Remove" class="rem">
  `;

  li.querySelector(".rem").addEventListener('click', () => removeTask(newTaskName));
  li.querySelector(".edit").addEventListener('click', () => editTask(li, newTaskName));
  li.querySelector("input[type='checkbox']").addEventListener('change', () => toggleComplete(newTaskName));

  showAlert("Task updated successfully!", "green");
  renderTasks();
}

function toggleComplete(taskName) {
  const taskIndex = todos.findIndex(todo => todo.name === taskName);
  todos[taskIndex].completed = !todos[taskIndex].completed;
  localStorage.setItem('todos', JSON.stringify(todos));
  showAlert(todos[taskIndex].completed ? "Task marked as completed!" : "Task marked as incomplete!", "green");
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = '';
  let filteredTodos = todos;

  if (filter === 'assigned') {
    filteredTodos = todos.filter(todo => !todo.completed);
  } else if (filter === 'completed') {
    filteredTodos = todos.filter(todo => todo.completed);
  }

  filteredTodos.forEach(todo => addTask(todo));
  updateNoTasksMessage();
  updateTaskCounter();
}

function clearAllTasks() {
  todos = [];
  localStorage.removeItem('todos');
  renderTasks();
  showAlert("All tasks cleared!", "green");
}

function showAlert(message, color) {
  alert.textContent = message;
  alert.style.color = color;
  alert.style.visibility = "visible";
  setTimeout(() => {
    alert.style.visibility = "hidden";
  }, 3000);
}

tabs.forEach((tab) => {
  tab.addEventListener('click', (e) => {
    tabs.forEach(tab => tab.classList.remove('active'));
    e.target.classList.add('active');
    updateLine(); 
  });
});

function filterTasks(type) {
  filter = type;
  renderTasks();
}

function updateNoTasksMessage() {
  noTasksMessage.style.display = taskList.children.length === 0 ? "" : "none";
}

function updateTaskCounter() {
  const assignedTasks = todos.filter(todo => !todo.completed).length;
  taskCounter.textContent = assignedTasks;
}
