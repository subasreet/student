import React from "react";
import { Search, Sparkles, Plus, AlertTriangle, ShieldCheck } from "lucide-react";
import { Student, Task } from "../types";

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenNewTask: () => void;
  onOpenNewPlan: () => void;
  onOpenAiChat: () => void;
  urgentTasksCount: number;
  criticalStudents: Student[];
  onSelectStudent: (student: Student) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenNewTask,
  onOpenNewPlan,
  onOpenAiChat,
  urgentTasksCount,
  criticalStudents,
  onSelectStudent,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  CarePilot
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                  Student Care Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Coordinated Academic & Wellness Management
              </p>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="flex-1 max-w-md mx-2">
            <button
              onClick={onOpenSearch}
              id="header-search-button"
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span className="hidden sm:inline">Search tasks, students, plans...</span>
                <span className="sm:hidden">Search...</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Urgent care badge indicator */}
            {urgentTasksCount > 0 && (
              <div
                title={`${urgentTasksCount} urgent care items requiring triage`}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{urgentTasksCount} Urgent</span>
              </div>
            )}

            {/* AI Assistant Quick Trigger */}
            <button
              onClick={onOpenAiChat}
              id="header-ai-copilot-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 fill-indigo-100" />
              <span>AI Copilot</span>
            </button>

            {/* New Task Button */}
            <button
              onClick={onOpenNewTask}
              id="header-new-task-btn"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-100 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Task</span>
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-xs flex items-center justify-center">
                SA
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">Dr. Sarah Althaus</p>
                <p className="text-[11px] text-slate-500">Lead Care Advisor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
