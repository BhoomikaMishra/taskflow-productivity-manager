
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const addBtn = document.getElementById("addBtn");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const totalTasks = document.getElementById("totalTasks");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filters button");

const greeting = document.getElementById("greeting");
const themeToggle = document.getElementById("themeToggle");



let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];

let currentFilter = "all";

let editTaskId = null;


function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );

}


function updateGreeting() {

    if (!greeting) return;

    const hour = new Date().getHours();

    if (hour < 12) {

        greeting.textContent = "Good Morning ☀️";

    } else if (hour < 18) {

        greeting.textContent = "Good Afternoon 🌤️";

    } else {

        greeting.textContent = "Good Evening 🌙";

    }

}



function clearForm() {

    taskInput.value = "";

    prioritySelect.value = "low";

    editTaskId = null;

    addBtn.innerHTML = `
        <i class="fa-solid fa-plus"></i>
        Add Task
    `;

}



function addTask() {

    const text = taskInput.value.trim();

    if (text === "") {

        alert("Please enter a task.");

        return;

    }

    const task = {

        id: Date.now(),

        text,

        priority: prioritySelect.value,

        completed: false

    };

    tasks.push(task);

    saveTasks();

    clearForm();

    renderTasks();

}



function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    taskInput.value = task.text;

    prioritySelect.value = task.priority;

    editTaskId = id;

    addBtn.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Update Task
    `;

    taskInput.focus();

}



function updateTask() {

    const text = taskInput.value.trim();

    if (text === "") {

        alert("Task cannot be empty.");

        return;

    }

    tasks = tasks.map(task => {

        if (task.id === editTaskId) {

            return {

                ...task,

                text,

                priority: prioritySelect.value

            };

        }

        return task;

    });

    saveTasks();

    clearForm();

    renderTasks();

}



function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            return {

                ...task,

                completed: !task.completed

            };

        }

        return task;

    });

    saveTasks();

    renderTasks();

}



function deleteTask(id) {

    const confirmDelete = confirm(
        "Delete this task?"
    );

    if (!confirmDelete) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();

}


addBtn.addEventListener("click", () => {

    if (editTaskId) {

        updateTask();

    } else {

        addTask();

    }

});


taskInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        addBtn.click();

    }

});



function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const pending = total - completed;

    totalTasks.textContent = total;

    pendingCount.textContent = pending;

    completedCount.textContent = completed;

}



function getFilteredTasks() {

    let filteredTasks = [...tasks];

    const keyword = searchInput.value.trim().toLowerCase();

    if (keyword) {

        filteredTasks = filteredTasks.filter(task =>
            task.text.toLowerCase().includes(keyword)
        );

    }


    switch (currentFilter) {

        case "pending":
            filteredTasks = filteredTasks.filter(task => !task.completed);
            break;

        case "completed":
            filteredTasks = filteredTasks.filter(task => task.completed);
            break;

        case "high":
            filteredTasks = filteredTasks.filter(task => task.priority === "high");
            break;

        default:
            break;

    }

    return filteredTasks;

}


function createTaskElement(task) {

    const li = document.createElement("li");

    li.className = "task-item";

    if (task.completed) {

        li.classList.add("completed");

    }

    li.innerHTML = `

        <div class="task-left">

            <p class="task-title">
                ${task.text}
            </p>

            <div class="task-meta">

                <span class="priority ${task.priority}">
                    ${task.priority.toUpperCase()}
                </span>

            </div>

        </div>


        <div class="task-actions">

            <button
                class="icon-btn complete-btn"
                data-action="toggle"
                data-id="${task.id}"
                title="Complete">

                <i class="fa-solid fa-check"></i>

            </button>


            <button
                class="icon-btn edit-btn"
                data-action="edit"
                data-id="${task.id}"
                title="Edit">

                <i class="fa-solid fa-pen"></i>

            </button>


            <button
                class="icon-btn delete-btn"
                data-action="delete"
                data-id="${task.id}"
                title="Delete">

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

    `;

    return li;

}


function renderTasks() {
    sortTasks();

    taskList.innerHTML = "";

    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {

        emptyState.classList.remove("hidden");

        taskList.classList.add("hidden");

    }

    else {

        emptyState.classList.add("hidden");

        taskList.classList.remove("hidden");

        filteredTasks.forEach(task => {

            taskList.appendChild(

                createTaskElement(task)

            );

        });

    }

    updateStatistics();

}


searchInput.addEventListener("input", renderTasks);

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn =>

            btn.classList.remove("active")

        );

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();

    });

});


taskList.addEventListener("click", (event) => {

    const button = event.target.closest("button");

    if (!button) return;

    const id = Number(button.dataset.id);

    const action = button.dataset.action;

    switch (action) {

        case "toggle":

            toggleTask(id);

            break;

        case "edit":

            editTask(id);

            break;

        case "delete":

            deleteTask(id);

            break;

    }

});


function sortTasks() {

    const priorityOrder = {
        high: 3,
        medium: 2,
        low: 1
    };

    tasks.sort((a, b) => {
    
        if (a.completed !== b.completed) {
            return a.completed - b.completed;
        }


        return priorityOrder[b.priority] - priorityOrder[a.priority];

    });

}


function loadTheme() {

    const savedTheme = localStorage.getItem("taskflowTheme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        themeToggle.innerHTML =
            '<i class="fa-solid fa-sun"></i>';

    }

    else {

        document.body.classList.remove("dark");

        themeToggle.innerHTML =
            '<i class="fa-solid fa-moon"></i>';

    }

}


themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const darkMode =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "taskflowTheme",
        darkMode ? "dark" : "light"
    );

    themeToggle.innerHTML = darkMode
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';

});


function initializeApp() {

    loadTheme();

    updateGreeting();

    renderTasks();

}

initializeApp();