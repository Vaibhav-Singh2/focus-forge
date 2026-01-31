"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/Header";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: false,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile saved:", { name, email });
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Settings
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Manage your account settings and preferences.
            </p>
          </div>

          <div className="max-w-3xl space-y-8">
            {/* Profile Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
                Profile Settings
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                    JD
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">
                      Change Avatar
                    </Button>
                    <p className="mt-2 text-xs text-zinc-500">
                      JPG, GIF or PNG. Max size of 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
                Notification Settings
              </h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      Email Notifications
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Receive email updates about your tasks
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          email: e.target.checked,
                        })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        notifications.email
                          ? "bg-violet-600"
                          : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                          notifications.email
                            ? "translate-x-5.5"
                            : "translate-x-0.5"
                        }`}
                        style={{
                          transform: notifications.email
                            ? "translateX(22px)"
                            : "translateX(2px)",
                        }}
                      />
                    </div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      Push Notifications
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          push: e.target.checked,
                        })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        notifications.push
                          ? "bg-violet-600"
                          : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5"
                        style={{
                          transform: notifications.push
                            ? "translateX(22px)"
                            : "translateX(2px)",
                        }}
                      />
                    </div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      Weekly Digest
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Receive a weekly summary of your activity
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={notifications.weekly}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          weekly: e.target.checked,
                        })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        notifications.weekly
                          ? "bg-violet-600"
                          : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5"
                        style={{
                          transform: notifications.weekly
                            ? "translateX(22px)"
                            : "translateX(2px)",
                        }}
                      />
                    </div>
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-red-200 dark:border-red-900/50 p-6"
            >
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                Danger Zone
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <Button
                variant="ghost"
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete Account
              </Button>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
