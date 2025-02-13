import React, { useState } from "react";
import { Task } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { API_URL } from "../config";
 
// Due date color mapping
// ✅ Function to determine the due date style & auto-update status
const getDueDateStyle = (task: Task, updateTaskStatus: (taskId: string, status: string) => void) => {
  if (!task.dueDate) return "bg-gray-300"; // No due date case


  const today = new Date();
  const due = new Date(task.dueDate);
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // ✅ NEW: If overdue, set status to "Missed" (only if not already "Missed")
    if (task.status !== "Done" && task.status !== "Overdue") {
      updateTaskStatus(task._id, "Overdue"); // Update to "Overdue" only if it's not Done
    }
    return "bg-red-500 text-white"; // Overdue
  }
  if (diffDays === 0) return "bg-yellow-500 text-white"; // Due Today
  if (diffDays <= 3) return "bg-orange-300 text-white"; // Almost due
  return "bg-blue-400 text-white"; // Far from due
};


interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  onToggleComplete: (taskId: string, Done: boolean) => void;
}



const TaskList: React.FC<TaskListProps> = ({ tasks, onDeleteTask, onUpdateTask}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // update task status in the backend
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await axios.put(`${API_URL}/${taskId}`, { status: newStatus }); // API call to update task
      onUpdateTask({ _id: taskId, status: newStatus } as Task); // Update local state
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  // task completion status toggle
  const handleToggleComplete = async (taskId: string, Done: boolean, dueDate?: string) => {
    try {
      let newStatus: "Pending" | "Done" | "Overdue" = Done ? "Done" : "Pending";
  
      // If task has a due date and is overdue, set status to "Overdue" when unmarked
      if (!Done && dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        if (due < today) {
          newStatus = "Overdue";
        }
      }
  
      await axios.put(`${API_URL}/${taskId}`, { status: newStatus }); // API call

      const updatedTask = tasks.find((task) => task._id === taskId);
      if (updatedTask) {
        onUpdateTask({ ...updatedTask, status: newStatus }); // Keep all properties intact
      }
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };
  

  // Open Edit Modal
  const handleEditClick = (task: Task) => {
    setEditTask(task);
    setIsEditModalOpen(true);
  };

  // Handle Task Update
  const handleUpdateTask = () => {
    if (editTask) {
      onUpdateTask(editTask);
      setIsEditModalOpen(false);
    }
  };

   // Function to open the delete confirmation modal
   const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId); // Store the task ID to be deleted
    setIsDeleteModalOpen(true); 
  };

// Function to confirm task deletion
const confirmDelete = () => {
  if (taskToDelete) {
    onDeleteTask(taskToDelete); // Call the delete function passed as a prop
    setIsDeleteModalOpen(false); 
  }
};
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {tasks?.map((task) => (
        <div key={task._id} className="border-white rounded-lg shadow-md bg-white p-4 relative">
          {/* Task Header */}
          <div className="flex justify-between items-center bg-blue-600 text-white px-3 py-2 rounded-t-md">
            <h3 className="font-bold">{task.title}</h3>
            <div className="flex space-x-2">
              {/* Edit Button */}
              <button className="text-white" onClick={() => handleEditClick(task)}>
                <FontAwesomeIcon icon={faEdit} className="hover:text-green-300" />
              </button>
              {/* Delete Button (Now Opens Modal) */}
              <button className="text-white" onClick={() => handleDeleteClick(task._id)}>
              <FontAwesomeIcon icon={faTrash} className="hover:text-red-300"/>
              </button>
            </div>
          </div>

          {/* Task Description */}
          <p className="text-gray-700 text-sm mt-2">
            {task.description || "No description available"}
          </p>

          {/* Due Date & Status */}
          <div className="flex justify-between items-center mt-3">
            <span className={`px-2 py-1 rounded ${getDueDateStyle(task, updateTaskStatus)}`}>
              {task.dueDate 
                ? new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })
                : "No due date"}

            </span>
            <span className={`px-2 py-1 rounded ${
            task.status === "Done" ? "bg-green-500 text-white" 
            : task.status === "Overdue" ? "bg-red-500 text-white" 
            : "bg-gray-200 text-gray-800"
            }`}>
              {task.status}
            </span>
          </div>

          {/* Task Completion Checkbox */}
          <div className="flex items-center mt-3">
            <input
              type="checkbox"
              checked={task.status === "Done"}
              onChange={() => handleToggleComplete(task._id, task.status !== "Done", task.dueDate)}
              className="mr-2"
            />
            <label className="text-gray-600">Mark as Done</label>
          </div>
        </div>
      ))}

      {/* Edit Task Modal */}
      {isEditModalOpen && editTask && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-5 rounded-md w-96">
            <div className="flex justify-between mb-3 ">
              <h2 className="text-xl font-semibold mx-auto">Edit Task</h2>
              <button onClick={() => setIsEditModalOpen(false)}>
                <FontAwesomeIcon icon={faTimes} className="text-red-800 hover:text-red-600" />
              </button>
            </div>

            <input
              type="text"
              value={editTask.title}
              onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
              className="w-full p-2 mb-2 border rounded-sm"
            />
            <textarea
              value={editTask.description}
              onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
              className="w-full p-2 mb-2 border rounded-sm"
            />
            <input
              type="date"
              value={editTask.dueDate || ""}
              onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
              className="w-full p-2 mb-2 border rounded-sm"
            />
            
            <div className="flex justify-between">
            <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-sm hover:bg-gray-500"
              >
                Cancel
              </button>
            <button
              onClick={handleUpdateTask}
              className="bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-600"
            >
              Update Task
            </button>
            </div>
          </div>
        </div>
      )}

       {/* Delete Confirmation Modal */}
       {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-5 rounded-md w-96">
            <h2 className="text-lg font-semibold mb-4">Are you sure you want to delete this task?</h2>
            <div className="flex justify-end space-x-3">
              {/* Cancel Button (Closes the modal) */}
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-sm hover:bg-gray-400"
              >
                Cancel
              </button>
              {/* Confirm Delete Button */}
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
