const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

// Fetch and display tasks
async function loadTasks(status = "") {
  let url = "/tasks";
  if (status) url += `?status=${status}`;

  const res = await fetch(url);
  const tasks = await res.json();

  taskList.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");

    // Add class based on status
    li.className = "";
    if (task.status === "done") li.classList.add("done");
    if (task.status === "in progress") li.classList.add("in-progress");

    li.innerHTML = `
      <span>${task.title}</span>
      <div>
        <button class="progress-btn" onclick="updateTaskStatus(${task.id}, 'in progress')">In Progress</button>
        <button class="done-btn" onclick="updateTaskStatus(${task.id}, 'done')">Done</button>
        <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

// Add new task
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const status = document.getElementById("status").value;

  await fetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, status })
  });

  taskForm.reset();
  loadTasks();
});

// Update task status
async function updateTaskStatus(id, status) {
  await fetch(`/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  loadTasks();
}

// Delete task
async function deleteTask(id) {
  await fetch(`/tasks/${id}`, { method: "DELETE" });
  loadTasks();
}

// Initial load
loadTasks();
