import React from "react";

interface Props {
  form: { title: string; description: string };
  editingId: string | null;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<Props> = ({ form, editingId, error, onChange, onSubmit, onCancel }) => (
  <form onSubmit={onSubmit} className="mb-4 space-y-2">
    <input
      className="border p-2 w-full"
      name="title"
      placeholder="Title"
      value={form.title}
      onChange={onChange}
    />
    <textarea
      className="border p-2 w-full"
      name="description"
      placeholder="Description"
      value={form.description}
      onChange={onChange}
    />
    <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
      {editingId ? "Update Task" : "Add Task"}
    </button>
    {editingId && (
      <button type="button" className="ml-2 bg-gray-300 px-4 py-2 rounded" onClick={onCancel}>
        Cancel
      </button>
    )}
    {error && <div className="text-red-500">{error}</div>}
  </form>
);

export default TaskForm;