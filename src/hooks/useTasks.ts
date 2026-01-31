"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Task } from "@/types/database.types";

// Local JSON storage - no Supabase!
export type SortField =
  | "position"
  | "created_at"
  | "due_date"
  | "priority"
  | "title"
  | "status";
export type SortDirection = "asc" | "desc";
export type FilterStatus = "all" | "pending" | "in-progress" | "completed";
export type FilterPriority = "all" | "low" | "medium" | "high";

interface TaskFilters {
  status: FilterStatus;
  priority: FilterPriority;
  search: string;
}

interface TaskSort {
  field: SortField;
  direction: SortDirection;
}

const priorityOrder = { high: 3, medium: 2, low: 1 };
const statusOrder = { "in-progress": 3, pending: 2, completed: 1 };

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: "all",
    search: "",
  });
  const [sort, setSort] = useState<TaskSort>({
    field: "position",
    direction: "asc",
  });

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tasks");
      const json = await res.json();

      if (json.error) throw new Error(json.error);
      setTasks(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch tasks"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTask = useCallback(
    async (
      task: Omit<
        Task,
        "id" | "user_id" | "created_at" | "updated_at" | "position"
      >,
    ) => {
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        });
        const json = await res.json();

        if (json.error) throw new Error(json.error);
        setTasks((prev) => [...prev, json.data]);
        return { data: json.data, error: null };
      } catch (err) {
        return {
          data: null,
          error: err instanceof Error ? err : new Error("Failed to add task"),
        };
      }
    },
    [],
  );

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      });
      const json = await res.json();

      if (json.error) throw new Error(json.error);
      setTasks((prev) => prev.map((t) => (t.id === id ? json.data : t)));
      return { data: json.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Failed to update task"),
      };
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      const json = await res.json();

      if (json.error) throw new Error(json.error);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error("Failed to delete task"),
      };
    }
  }, []);

  const bulkDelete = useCallback(async (ids: string[]) => {
    try {
      const res = await fetch(`/api/tasks?ids=${ids.join(",")}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.error) throw new Error(json.error);
      setTasks((prev) => prev.filter((t) => !ids.includes(t.id)));
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error("Failed to delete tasks"),
      };
    }
  }, []);

  const bulkUpdate = useCallback(
    async (ids: string[], updates: Partial<Task>) => {
      try {
        const res = await fetch("/api/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, updates }),
        });
        const json = await res.json();

        if (json.error) throw new Error(json.error);
        setTasks((prev) =>
          prev.map((t) => (ids.includes(t.id) ? { ...t, ...updates } : t)),
        );
        return { error: null };
      } catch (err) {
        return {
          error:
            err instanceof Error ? err : new Error("Failed to update tasks"),
        };
      }
    },
    [],
  );

  const reorderTasks = useCallback(
    async (reorderedTasks: Task[]) => {
      try {
        // Optimistic update
        setTasks(reorderedTasks);

        const res = await fetch("/api/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reorder: reorderedTasks }),
        });
        const json = await res.json();

        if (json.error) {
          fetchTasks(); // Revert on error
          throw new Error(json.error);
        }
        return { error: null };
      } catch (err) {
        return {
          error:
            err instanceof Error ? err : new Error("Failed to reorder tasks"),
        };
      }
    },
    [fetchTasks],
  );

  const updateStatus = useCallback(
    async (id: string, status: "pending" | "in-progress" | "completed") => {
      return updateTask(id, { status });
    },
    [updateTask],
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return { data: null, error: new Error("Task not found") };
      const newStatus = task.status === "completed" ? "pending" : "completed";
      return updateTask(id, { status: newStatus });
    },
    [tasks, updateTask],
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Apply filters
    if (filters.status !== "all") {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters.priority !== "all") {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case "position":
          comparison = a.position - b.position;
          break;
        case "created_at":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "due_date":
          if (!a.due_date && !b.due_date) comparison = 0;
          else if (!a.due_date) comparison = 1;
          else if (!b.due_date) comparison = -1;
          else
            comparison =
              new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case "priority":
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case "status":
          comparison = statusOrder[b.status] - statusOrder[a.status];
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sort.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [tasks, filters, sort]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      overdue: tasks.filter(
        (t) =>
          t.status !== "completed" &&
          t.due_date &&
          new Date(t.due_date) < new Date(),
      ).length,
    }),
    [tasks],
  );

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    stats,
    isLoading,
    error,
    filters,
    sort,
    setFilters,
    setSort,
    refetch: fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    bulkDelete,
    bulkUpdate,
    reorderTasks,
    toggleComplete,
    updateStatus,
  };
}
