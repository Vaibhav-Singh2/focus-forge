"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Task } from "@/types/database.types";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError(new Error("Not authenticated"));
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch tasks"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTask = useCallback(
    async (
      task: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">,
    ) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
          .from("tasks")
          .insert({ ...task, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        setTasks((prev) => [data, ...prev]);
        return { data, error: null };
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Failed to update task"),
      };
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error("Failed to delete task"),
      };
    }
  }, []);

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

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [payload.new as Task, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === payload.new.id ? (payload.new as Task) : t,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = {
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
  };

  return {
    tasks,
    stats,
    isLoading,
    error,
    refetch: fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    updateStatus,
  };
}
