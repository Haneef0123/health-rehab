"use client";

import { Menu, Bell, Search } from "lucide-react";
import { useUIStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-sm sm:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        className="lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Search bar */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative hidden w-full max-w-md sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search exercises, logs, or insights..."
            className="w-full pl-10"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <Badge
            variant="error"
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            3
          </Badge>
        </Button>

        {/* Current date/time - helpful for logging */}
        <div className="hidden items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm md:flex">
          <div className="font-medium text-gray-900">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div className="text-gray-600">
            {new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
