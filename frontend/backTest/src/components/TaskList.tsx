import React from "react";
import type { Task } from "../types/index";

interface Props {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskList: React.FC<Props> = ({ tasks, onEdit, onDelete }) => (
  <ul className="space-y-2">
    {tasks.map((task) => (
      <li key={task.id} className="border p-2 flex justify-between items-center">
        <div>
          <div className="font-semibold">{task.title}</div>
          <div className="text-sm text-gray-600">{task.description}</div>
        </div>
        <div>
          <button
            className="bg-yellow-400 text-white px-2 py-1 rounded mr-2"
            onClick={() => onEdit(task)}
          >
            Edit
          </button>
          <button
            className="bg-red-500 text-white px-2 py-1 rounded"
            onClick={() => onDelete(task.id)}
          >
            Delete
          </button>
        </div>
      </li>
    ))}
  </ul>
);

export default TaskList;
