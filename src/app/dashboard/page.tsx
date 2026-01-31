"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/Header";
import StatCard from "@/components/dashboard/StatCard";
import { useTasks } from "@/hooks/useTasks";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/providers/AuthProvider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const statusColors = {
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "in-progress":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pending: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
};

const priorityColors = {
  high: "text-red-500",
  medium: "text-yellow-500",
  low: "text-green-500",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, stats, isLoading, addTask, toggleComplete, deleteTask } = useTasks();
  const { profile } = useProfile();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await addTask({
      title: newTaskTitle,
      description: "",
      priority: newTaskPriority,
      status: "pending",
      due_date: null,
    });

    setNewTaskTitle("");
    setShowAddTask(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statsData = [
    {
      title: "Total Tasks",
      value: stats.total.toString(),
      change: "+0%",
      changeType: "neutral" as const,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      title: "Completed",
      value: stats.completed.toString(),
      change: stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : "0%",
      changeType: "positive" as const,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "In Progress",
      value: (stats.inProgress || 0).toString(),
      change: stats.total > 0 ? `${Math.round(((stats.inProgress || 0) / stats.total) * 100)}%` : "0%",
      changeType: "neutral" as const,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Overdue",
      value: stats.overdue.toString(),
      change: stats.overdue > 0 ? "Action needed" : "All good!",
      changeType: stats.overdue > 0 ? ("negative" as const) : ("positive" as const),
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Welcome back, {displayName}! Here&apos;s what&apos;s happening today.
              </p>
            </div>
            <Button onClick={() => setShowAddTask(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </Button>
          </div>

          {/* Add Task Modal */}
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowAddTask(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Add New Task</h2>
                <form onSubmit={handleAddTask} className="space-y-4">
                  <Input
                    label="Task Title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")}
                      className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="secondary" type="button" onClick={() => setShowAddTask(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Task</Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
          </div>

          {/* Recent Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
          >
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Recent Tasks
              </h2>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-zinc-500">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-zinc-500 mb-4">No tasks yet. Create your first task!</p>
                <Button onClick={() => setShowAddTask(true)}>Add Task</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {tasks.slice(0, 10).map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${task.status === "completed" ? "line-through text-zinc-400" : "text-zinc-900 dark:text-white"}`}>
                            {task.title}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium capitalize ${priorityColors[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                          {formatDate(task.due_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleComplete(task.id)}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-green-500"
                              title={task.status === "completed" ? "Mark pending" : "Mark complete"}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-red-500"
                              title="Delete task"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
