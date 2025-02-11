// Task model

import mongoose from "mongoose";

// Define the Task schema
const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      default: "Pending", // Default status is "Pending"
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the Task model
const Task = mongoose.model("Task", taskSchema);

export default Task;
