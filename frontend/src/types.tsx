export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate: string | undefined; // Optional field
  status: "Pending" | "Done" | "Overdue";
}
