import React, { useState, useEffect, useRef } from "react";
import { Search, X, CheckSquare, Layers, User, ArrowRight, Flame } from "lucide-react";
import { Task, CarePlan, Student } from "../types";
import { getPriorityBadge, getCategoryBadge, formatDate } from "../utils/helpers";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  carePlans: CarePlan[];
  students: Student[];
  onSelectTask: (task: Task) => void;
  onSelectPlan: (plan: CarePlan) => void;
  onSelectStudent: (student: Student) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  tasks,
  carePlans,
  students,
  onSelectTask,
  onSelectPlan,
  onSelectStudent,
}) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Global keydown handler for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredTasks = q
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.studentName?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
    : tasks.slice(0, 4);

  const filteredStudents = q
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.major.toLowerCase().includes(q) ||
          s.studentNumber.toLowerCase().includes(q) ||
          s.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
    : students.slice(0, 3);

  const filteredPlans = q
    ? carePlans.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.studentName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : carePlans.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search tasks, students, care plans, or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 text-slate-900 text-sm sm:text-base focus:outline-none placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono text-slate-400 bg-white border border-slate-200 rounded">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-5 divide-y divide-slate-100">
          {/* Students Section */}
          {filteredStudents.length > 0 && (
            <div className="space-y-2 pt-2 first:pt-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Students</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => {
                      onSelectStudent(student);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs text-slate-900 group-hover:text-indigo-600 truncate">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {student.major} • GPA {student.gpa}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {filteredTasks.length > 0 && (
            <div className="space-y-2 pt-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Care Tasks ({filteredTasks.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredTasks.map((task) => {
                  const priorityBadge = getPriorityBadge(task.priority);
                  const categoryBadge = getCategoryBadge(task.category);

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        onSelectTask(task);
                        onClose();
                      }}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${priorityBadge.bg} ${priorityBadge.text}`}>
                            {priorityBadge.label}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[10px] font-medium rounded ${categoryBadge.bg} ${categoryBadge.text}`}>
                            {categoryBadge.label}
                          </span>
                          {task.studentName && (
                            <span className="text-[11px] text-slate-500 truncate">
                              • {task.studentName}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 truncate">
                          {task.title}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                        {formatDate(task.dueDate)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Care Plans Section */}
          {filteredPlans.length > 0 && (
            <div className="space-y-2 pt-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Care Plans ({filteredPlans.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => {
                      onSelectPlan(plan);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                        {plan.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Student: {plan.studentName} • Lead: {plan.leadCounselor}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-indigo-600 shrink-0">
                      {plan.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredStudents.length === 0 && filteredTasks.length === 0 && filteredPlans.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Search across student records, tasks, plans, and case notes</span>
          <span className="font-mono">Press ↵ to select</span>
        </div>
      </div>
    </div>
  );
};
