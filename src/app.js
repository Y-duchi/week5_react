import { createElement, createRoot, useEffect, useMemo, useState } from "./framework/reactCore.js";

const INITIAL_TODOS = [
  { id: 1, text: "Add custom render pipeline demo item", done: false },
  { id: 2, text: "Explain hook behavior after implementation", done: true },
];

function Header({ title, remaining, total }) {
  return createElement(
    "header",
    { className: "todo-header" },
    createElement("h1", null, title),
    createElement("p", { className: "todo-subtitle" }, `Remaining tasks: ${remaining}/${total}`),
  );
}

function Filters({ filter, onFilterChange }) {
  return createElement(
    "div",
    { className: "filters" },
    createElement(
      "button",
      {
        type: "button",
        className: filter === "all" ? "active" : "",
        onClick: () => onFilterChange("all"),
      },
      "all",
    ),
    createElement(
      "button",
      {
        type: "button",
        className: filter === "active" ? "active" : "",
        onClick: () => onFilterChange("active"),
      },
      "active",
    ),
    createElement(
      "button",
      {
        type: "button",
        className: filter === "done" ? "active" : "",
        onClick: () => onFilterChange("done"),
      },
      "done",
    ),
  );
}

function TodoItem({ todo, onToggle, onDelete }) {
  return createElement(
    "li",
    { className: `todo-item ${todo.done ? "is-done" : ""}` },
    createElement(
      "label",
      { className: "item-row" },
      createElement(
        "input",
        {
          type: "checkbox",
          checked: !!todo.done,
          onChange: () => onToggle(todo.id),
        },
      ),
      createElement("span", null, todo.text),
    ),
    createElement(
      "button",
      { type: "button", className: "danger", onClick: () => onDelete(todo.id) },
      "delete",
    ),
  );
}

function TodoList({ list, onToggle, onDelete }) {
  if (list.length === 0) {
    return createElement("p", { className: "empty-list" }, "No items to show.");
  }

  return createElement(
    "ul",
    { className: "todo-list" },
    ...list.map((todo) =>
      createElement(TodoItem, {
        key: todo.id,
        todo,
        onToggle,
        onDelete,
      }),
    ),
  );
}

function App() {
  const [tasks, setTasks] = useState(INITIAL_TODOS);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const doneCount = useMemo(
    () => tasks.filter((task) => task.done).length,
    [tasks],
  );

  const visibleTasks = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();
    return tasks.filter((todo) => {
      const hasQuery = loweredQuery === "" || todo.text.toLowerCase().includes(loweredQuery);
      const inFilter =
        filter === "all" ? true : filter === "done" ? todo.done : !todo.done;
      return hasQuery && inFilter;
    });
  }, [tasks, query, filter]);

  useEffect(() => {
    document.title = `Remaining tasks: ${tasks.length - doneCount}`;
  }, [tasks.length, doneCount]);

  useEffect(() => {
    const container = document.getElementById("app-shell");
    if (!container) return;
    const handler = (event) => {
      if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
        if (!event.target.value.trim()) {
          return;
        }
        addTodo(event.target.value.trim());
      }
    };
    container.addEventListener("keydown", handler);
    return () => container.removeEventListener("keydown", handler);
  }, []);

  function addTodo(nextText) {
    if (!nextText || !nextText.trim()) {
      return;
    }

    const nextTask = {
      id: Date.now(),
      text: nextText.trim(),
      done: false,
    };

    setTasks((prev) => [...prev, nextTask]);
    setQuery("");
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  const inputProps = {
    type: "text",
    value: query,
    placeholder: "Type task and press Add",
    onInput: (event) => {
      setQuery(event.target.value ?? "");
    },
  };

  return createElement(
    "main",
    { className: "todo-shell" },
    createElement(Header, {
      title: "Todo Manager (Week 5)",
      remaining: tasks.length - doneCount,
      total: tasks.length,
    }),
    createElement(
      "section",
      { className: "composer card" },
      createElement("input", inputProps),
      createElement(
        "button",
        {
          type: "button",
          className: "primary",
          onClick: () => addTodo(query),
        },
        "add",
      ),
    ),
    createElement(Filters, {
      filter,
      onFilterChange: setFilter,
    }),
    createElement(TodoList, {
      list: visibleTasks,
      onToggle: toggleTask,
      onDelete: deleteTask,
    }),
    createElement(
      "p",
      { className: "footnote" },
      `Completed: ${doneCount}, Remaining: ${tasks.length - doneCount}`,
    ),
  );
}

const mountPoint = document.getElementById("app");
if (mountPoint) {
  createRoot(App, mountPoint);
}
