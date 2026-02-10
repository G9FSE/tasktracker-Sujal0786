const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public")); // serve frontend files

// Helper functions to read/write tasks
function readTasks() {
  if (!fs.existsSync("tasks.json")) {
    fs.writeFileSync("tasks.json", "[]");
  }
  const data = fs.readFileSync("tasks.json");
  return JSON.parse(data);
}

function saveTasks(tasks) {
  fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));
}

// ------------------ CLI MODE ------------------
const args = process.argv.slice(2);

if (args.length > 0) {
  const command = args[0];
  const tasks = readTasks();

  switch (command) {
    case "add":
      const title = args[1];
      if (!title) {
        console.log('Usage: node index.js add "Task Title"');
        process.exit();
      }
      const id = tasks.length ? tasks[tasks.length - 1].id + 1 : 1;
      const newTask = { id, title, status: "not done" };
      tasks.push(newTask);
      saveTasks(tasks);
      console.log("Task added:", newTask);
      process.exit();
      break;

    case "list":
      const filterStatus = args[1]; // optional: done / "not done" / in progress
      let listTasks = tasks;
      if (filterStatus) {
        listTasks = tasks.filter(t => t.status === filterStatus);
      }
      if (listTasks.length === 0) {
        console.log("No tasks found.");
      } else {
        console.log("Tasks:");
        listTasks.forEach(t => console.log(`${t.id}. ${t.title} - ${t.status}`));
      }
      process.exit();
      break;

    case "update":
      const updateId = parseInt(args[1]);
      const newStatus = args[2];
      if (!updateId || !newStatus) {
        console.log("Usage: node index.js update <id> <status>");
        process.exit();
      }
      const task = tasks.find(t => t.id === updateId);
      if (!task) {
        console.log("Task not found");
        process.exit();
      }
      task.status = newStatus;
      saveTasks(tasks);
      console.log("Task updated:", task);
      process.exit();
      break;

    case "delete":
      const deleteId = parseInt(args[1]);
      if (!deleteId) {
        console.log("Usage: node index.js delete <id>");
        process.exit();
      }
      const filteredTasks = tasks.filter(t => t.id !== deleteId);
      saveTasks(filteredTasks);
      console.log(`Task ${deleteId} deleted`);
      process.exit();
      break;

    default:
      console.log("Unknown command. Available commands: add, list, update, delete");
      process.exit();
  }
}

// ------------------ WEB SERVER MODE ------------------

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Get all tasks / filter by status
app.get("/tasks", (req, res) => {
  const tasks = readTasks();
  const status = req.query.status;
  if (status) {
    return res.json(tasks.filter(task => task.status === status));
  }
  res.json(tasks);
});

// Add task
app.post("/tasks", (req, res) => {
  const tasks = readTasks();
  const { title, status } = req.body;
  const id = tasks.length ? tasks[tasks.length - 1].id + 1 : 1;
  const newTask = { id, title, status: status || "not done" };
  tasks.push(newTask);
  saveTasks(tasks);
  res.json(newTask);
});

// Update task
app.put("/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const { id } = req.params;
  const { title, status } = req.body;
  const task = tasks.find(t => t.id == id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  if (title) task.title = title;
  if (status) task.status = status;
  saveTasks(tasks);
  res.json(task);
});

// Delete task
app.delete("/tasks/:id", (req, res) => {
  let tasks = readTasks();
  const { id } = req.params;
  tasks = tasks.filter(t => t.id != id);
  saveTasks(tasks);
  res.json({ message: "Task deleted" });
});

// Start web server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
