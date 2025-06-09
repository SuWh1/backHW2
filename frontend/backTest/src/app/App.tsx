import React, { useEffect, useState } from "react";
import axios from "axios";

interface Task {
  id: number;
  title: string;
  description: string;
}

const API_URL = "http://localhost:8000/tasks";

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<{ title?: string; description?: string }>(
    {}
  );
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchTasks = async () => {
    const res = await axios.get<Task[]>(API_URL);
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    if (editingId === null) {
      await axios.post(API_URL, form);
    } else {
      await axios.put(`${API_URL}/${editingId}`, form);
      setEditingId(null);
    }
    setForm({});
    fetchTasks();
  };

  const handleEdit = (task: Task) => {
    setForm(task);
    setEditingId(task.id);
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchTasks();
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Task CRUD</h1>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          className="border p-2 w-full"
          name="title"
          placeholder="Title"
          value={form.title ?? ""}
          onChange={handleChange}
        />
        <textarea
          className="border p-2 w-full"
          name="description"
          placeholder="Description"
          value={form.description ?? ""}
          onChange={handleChange}
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
              setForm({});
              setEditingId(null);
            }}
          >
            Cancel
          </button>
        )}
      </form>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="border p-2 flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{task.title}</div>
              <div className="text-sm text-gray-600">{task.description}</div>
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
    </div>
  );
};

export default App;
