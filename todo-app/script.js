// To-Do List Application with Local Storage

class TodoApp {
    constructor() {
        // DOM Elements
        this.todoForm = document.getElementById('todoForm');
        this.todoInput = document.getElementById('todoInput');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.clearAllBtn = document.getElementById('clearAll');
        this.totalTasksSpan = document.getElementById('totalTasks');
        this.activeTasksSpan = document.getElementById('activeTasks');
        this.completedTasksSpan = document.getElementById('completedTasks');

        // State
        this.todos = [];
        this.currentFilter = 'all';
        this.storageKey = 'todos';

        // Initialize
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.attachEventListeners();
        this.render();
    }

    attachEventListeners() {
        // Form submission
        this.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // Filter buttons
        this.filterBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach((b) => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Clear buttons
        this.clearCompletedBtn.addEventListener('click', () => {
            this.clearCompleted();
        });

        this.clearAllBtn.addEventListener('click', () => {
            if (this.todos.length > 0 && confirm('Are you sure you want to delete all tasks?')) {
                this.clearAll();
            }
        });
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
        };

        this.todos.unshift(todo);
        this.saveToStorage();
        this.render();
        this.todoInput.value = '';
        this.todoInput.focus();
    }

    toggleTodo(id) {
        const todo = this.todos.find((t) => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter((t) => t.id !== id);
        this.saveToStorage();
        this.render();
    }

    clearCompleted() {
        const completedCount = this.todos.filter((t) => t.completed).length;
        if (completedCount > 0 && confirm(`Delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter((t) => !t.completed);
            this.saveToStorage();
            this.render();
        }
    }

    clearAll() {
        this.todos = [];
        this.saveToStorage();
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter((t) => !t.completed);
            case 'completed':
                return this.todos.filter((t) => t.completed);
            default:
                return this.todos;
        }
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter((t) => t.completed).length;
        const active = total - completed;

        this.totalTasksSpan.textContent = total;
        this.activeTasksSpan.textContent = active;
        this.completedTasksSpan.textContent = completed;
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        this.updateStats();

        this.todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <p>📭 No tasks here</p>
                <small>${
                    this.currentFilter === 'all'
                        ? 'Create a new task to get started!'
                        : `No ${this.currentFilter} tasks`
                }</small>
            `;
            this.todoList.appendChild(emptyState);
            return;
        }

        filteredTodos.forEach((todo) => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    data-id="${todo.id}"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="delete-btn" data-id="${todo.id}">Delete</button>
            `;

            // Checkbox listener
            li.querySelector('.checkbox').addEventListener('change', () => {
                this.toggleTodo(todo.id);
            });

            // Delete button listener
            li.querySelector('.delete-btn').addEventListener('click', () => {
                this.deleteTodo(todo.id);
            });

            this.todoList.appendChild(li);
        });
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.todos = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            this.todos = [];
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TodoApp();
    });
} else {
    new TodoApp();
}