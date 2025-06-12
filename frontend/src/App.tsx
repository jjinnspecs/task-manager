import React, { useState, useEffect } from "react";
import axios from "axios";
import TaskList from "./components/TaskList";
import { Task } from "./types";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "./config";

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Add Task Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "" });

  // Fetch tasks from the API
  useEffect(() => {
    // console.log("API_URL:", API_URL);
    const fetchTasks = async () => {
      try {
        const response = await axios.get(API_URL);
        setTasks(response.data);
      } catch (err) {
        setError("Failed to fetch tasks");
      }
      setLoading(false);
    };
    fetchTasks();
    // const fetchTasks = async () => {
    //   try {
    //     const response = await fetch("https://task-manager-1f3q.onrender.com/api/tasks");
    //     const data = await response.json();
    //     console.log("Tasks:", data);
    //   } catch (error) {
    //     console.error("Error fetching tasks:", error);
    //   }
    // };
    // fetchTasks();
    
  }, []);

  // Handle Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await axios.delete(`${API_URL}/${taskId}`);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  // Handle Update Task
  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      await axios.put(`${API_URL}/${updatedTask._id}`, updatedTask);
      setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
    } catch (err) {
      setError("Failed to update task");
    }
  };

  // Handle Task Completion Toggle
  const handleToggleComplete = async (taskId: string, done: boolean) => {
    try {
      const updatedTask = tasks.find((task) => task._id === taskId);
      if (!updatedTask) return;

      const updatedStatus = done ? "Done" : "Pending";
      await axios.put(`${API_URL}/${taskId}`, { ...updatedTask, status: updatedStatus });

      setTasks(tasks.map((task) =>
        task._id === taskId ? { ...task, status: updatedStatus } : task
      ));
    } catch (err) {
      setError("Failed to update task status");
    }
  };

  // Handle Search
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle Add Task
  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        ...newTask,
        dueDate: newTask.dueDate || null,
        status: "Pending",
      });

      setTasks([...tasks, response.data]);
      setNewTask({ title: "", description: "", dueDate: "" });
      setIsAddModalOpen(false);
    } catch (err) {
      setError("Failed to add task");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl text-center mb-4 text-gray-600 font-bold">Task Manager</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-indigo-100 rounded-md p-5">
      {/* Search Bar & Add Task Button */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border-none rounded-2xl outline-none bg-white"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-400 flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-600 hover:text-white "
        >
          <FontAwesomeIcon icon={faPlus} className="text-white "/>
        </button>
      </div>

      {/* Task List */}
        {loading ? (
        <p className="text-center text-gray-600">Loading tasks...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredTasks.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">No tasks found. Try adding one!</p>
      ) : (
        <TaskList
          tasks={filteredTasks}
          onDeleteTask={handleDeleteTask}
          onUpdateTask={handleUpdateTask}
          onToggleComplete={handleToggleComplete}
        />
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-200 p-5 rounded-md w-96">
            <div className="flex justify-between mb-3">
              <h2 className="text-xl font-semibold mx-auto">Add Task</h2>
              <button onClick={() => setIsAddModalOpen(false)}>
                <FontAwesomeIcon icon={faTimes} className="text-red-800 hover:text-red-600" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full p-2 mb-2 rounded-sm bg-white"
            />
            <textarea
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full p-2 mb-2 rounded-sm bg-white"
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="w-full p-2 mb-4 rounded-sm bg-white"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-sm hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-600"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default App;
