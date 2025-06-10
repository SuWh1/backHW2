import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header";

interface Task {
  id: string;
  title: string;
  description: string;
  owner_id?: string;
}

const API_URL = "https://nfact-web-hw5.onrender.com/";

const App: React.FC = () => {
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null
  );
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState<string | null>(null);

  // Task state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskForm, setTaskForm] = useState<{
    title: string;
    description: string;
  }>({ title: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Axios: attach token to all requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (!config.headers) config.headers = {};
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  // Fetch tasks if logged in
  useEffect(() => {
    if (token) fetchTasks();
    // eslint-disable-next-line
  }, [token]);

  // Auth handlers
  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (authMode === "signup") {
        // Register
        await axios.post(`${API_URL}/register`, authForm);
      }
      // Login (after signup or directly)
      const res = await axios.post<{ access_token: string }>(
        `${API_URL}/login`,
        authForm
      );
      setToken(res.data.access_token);
      // Optionally decode token to get user info, or fetch /me endpoint
      // For now, just set username
      setUser({ id: "", username: authForm.username });
      setAuthForm({ username: "", password: "" });
    } catch (err: any) {
      setAuthError(err.response?.data?.detail || "Auth failed");
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setTasks([]);
  };

  // Task handlers
  const fetchTasks = async () => {
    setTaskError(null);
    try {
      const res = await axios.get<Task[]>(`${API_URL}/tasks`);
      setTasks(res.data);
    } catch (err: any) {
      setTaskError(err.response?.data?.detail || "Failed to fetch tasks");
    }
  };

  const handleTaskChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskError(null);
    try {
      if (!taskForm.title || !taskForm.description) return;
      if (editingId === null) {
        await axios.post(`${API_URL}/tasks`, taskForm);
      } else {
        await axios.put(`${API_URL}/tasks/${editingId}`, taskForm);
        setEditingId(null);
      }
      setTaskForm({ title: "", description: "" });
      fetchTasks();
    } catch (err: any) {
      setTaskError(err.response?.data?.detail || "Task action failed");
    }
  };

  const handleEdit = (task: Task) => {
    setTaskForm({ title: task.title, description: task.description });
    setEditingId(task.id);
  };

  const handleDelete = async (id: string) => {
    setTaskError(null);
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      fetchTasks();
    } catch (err: any) {
      setTaskError(err.response?.data?.detail || "Delete failed");
    }
  };

  // UI
  return (
    <div className="max-w-xl mx-auto p-4">
      <Header
        isLoggedIn={!!token}
        user={user ? { username: user.username } : undefined}
        onLogin={() => setAuthMode("login")}
        onSignup={() => setAuthMode("signup")}
        onLogout={handleLogout}
      />
      {!token ? (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">
            {authMode === "login" ? "Login" : "Sign Up"}
          </h2>
          <form onSubmit={handleAuthSubmit} className="space-y-2">
            <input
              className="border p-2 w-full"
              name="username"
              placeholder="Username"
              value={authForm.username}
              onChange={handleAuthChange}
              autoComplete="username"
            />
            <input
              className="border p-2 w-full"
              name="password"
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={handleAuthChange}
              autoComplete={
                authMode === "login" ? "current-password" : "new-password"
              }
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              type="submit"
            >
              {authMode === "login" ? "Login" : "Sign Up"}
            </button>
            {authError && <div className="text-red-500">{authError}</div>}
          </form>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Task CRUD</h1>
          <form onSubmit={handleTaskSubmit} className="mb-4 space-y-2">
            <input
              className="border p-2 w-full"
              name="title"
              placeholder="Title"
              value={taskForm.title}
              onChange={handleTaskChange}
            />
            <textarea
              className="border p-2 w-full"
              name="description"
              placeholder="Description"
              value={taskForm.description}
              onChange={handleTaskChange}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              type="submit"
            >
              {editingId === null ? "Add Task" : "Update Task"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                className="ml-2 bg-gray-300 px-4 py-2 rounded"
                onClick={() => {
                  setTaskForm({ title: "", description: "" });
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            )}
            {taskError && <div className="text-red-500">{taskError}</div>}
          </form>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="border p-2 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">{task.title}</div>
                  <div className="text-sm text-gray-600">
                    {task.description}
                  </div>
                </div>
                <div>
                  <button
                    className="bg-yellow-400 text-white px-2 py-1 rounded mr-2"
                    onClick={() => handleEdit(task)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default App;
