import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import AuthForm from "./components/AuthForm";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import ChatBox from "./components/Chat";
import type { GeminiResponse } from "./types/index";

interface Task {
  id: string;
  title: string;
  description: string;
  owner_id?: string;
}

const API_URL = "http://localhost:8000";

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null
  );
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskForm, setTaskForm] = useState({ title: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  const [chatMode, setChatMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const newMessage = { role: "user", content: chatInput };
    setChatHistory((prev) => [...prev, newMessage]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await axios.post<GeminiResponse>(`${API_URL}/gemini-chat`, {
        message: chatInput,
      });
    
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: res.data.response },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to get response from Gemini." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (!config.headers) config.headers = {};
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (authMode === "signup") {
        await axios.post(`${API_URL}/register`, authForm);
      }
      const res = await axios.post<{ access_token: string }>(
        `${API_URL}/login`,
        authForm
      );
      setToken(res.data.access_token);
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

  const fetchTasks = async () => {
    setTaskError(null);
    try {
      const res = await axios.get<Task[]>(`${API_URL}/tasks`);
      setTasks(res.data);
    } catch (err: any) {
      setTaskError(err.response?.data?.detail || "Failed to fetch tasks");
    }
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

  return (
    <div className="max-w-xl mx-auto p-4">
      <Header
        isLoggedIn={!!token}
        user={user ? { username: user.username } : undefined}
        onLogin={() => setAuthMode("login")}
        onSignup={() => setAuthMode("signup")}
        onLogout={handleLogout}
        chatMode={chatMode}
        setChatMode={setChatMode}
      />
      {chatMode ? (
        <ChatBox
          chatHistory={chatHistory}
          chatInput={chatInput}
          setChatInput={setChatInput}
          onSend={sendChatMessage}
          chatLoading={chatLoading}
        />
      ) : !token ? (
        <AuthForm
          mode={authMode}
          form={authForm}
          onChange={(e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value })}
          onSubmit={handleAuthSubmit}
          error={authError}
        />
      ) : (
        <>
          <TaskForm
            form={taskForm}
            onChange={(e) =>
              setTaskForm({ ...taskForm, [e.target.name]: e.target.value })
            }
            onSubmit={handleTaskSubmit}
            editingId={editingId}
            onCancel={() => {
              setTaskForm({ title: "", description: "" });
              setEditingId(null);
            }}
            error={taskError}
          />
          <TaskList tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} />
        </>
      )}
    </div>
  );
};

export default App;
