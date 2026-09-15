import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Kanban,
  List as ListIcon,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  MoreHorizontal,
  ArrowRight,
  Flame,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Task, TaskStatus, PriorityLevel, CareCategory } from "../types";
import { getPriorityBadge, getCategoryBadge, getStatusBadge, formatDate, isOverdue } from "../utils/helpers";

interface TaskManagementViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
  onToggleTaskStatus: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onToggleChecklistItem: (taskId: string, checklistId: string) => void;
  onOpenAiAssistant: () => void;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({
  tasks,
  onSelectTask,
  onOpenNewTask,
  onToggleTaskStatus,
  onUpdateTaskStatus,
  onToggleChecklistItem,
  onOpenAiAssistant,
}) => {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [urgentOnly, setUrgentOnly] = useState(false);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchStudent = t.studentName?.toLowerCase().includes(q);
        const matchAssignee = t.assignee?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchStudent && !matchAssignee) {
          return false;
        }
      }
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (urgentOnly && t.priority !== "urgent" && t.priority !== "high") return false;
      return true;
    });
  }, [tasks, searchQuery, statusFilter, categoryFilter, priorityFilter, urgentOnly]);

  const columns: { id: TaskStatus; label: string; bg: string; dot: string }[] = [
    { id: "todo", label: "To Do", bg: "bg-slate-100", dot: "bg-slate-500" },
    { id: "in_progress", label: "In Progress", bg: "bg-indigo-50", dot: "bg-indigo-600" },
    { id: "waiting", label: "Waiting / Review", bg: "bg-amber-50", dot: "bg-amber-500" },
    { id: "completed", label: "Completed", bg: "bg-emerald-50", dot: "bg-emerald-600" },
  ];

  const handleMarkComplete = (taskId: string, currentStatus: TaskStatus) => {
    if (currentStatus !== "completed") {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      onUpdateTaskStatus(taskId, "completed");
    } else {
      onUpdateTaskStatus(taskId, "todo");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Task Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize, triage, and track interventions across your student caseload.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View mode toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                viewMode === "kanban" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* AI Prioritize Trigger */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Triage</span>
          </button>

          {/* Add task button */}
          <button
            onClick={onOpenNewTask}
            id="tasks-add-task-btn"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter tasks, students, assignees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Urgent only pill */}
            <button
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                urgentOnly
                  ? "bg-rose-100 text-rose-800 border-rose-300"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Urgent Only</span>
            </button>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Domains</option>
              <option value="academic">Academic</option>
              <option value="wellness">Mental Wellness</option>
              <option value="financial">Financial Aid</option>
              <option value="accommodation">Accommodation</option>
              <option value="advising">Advising</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Status (especially useful in table view) */}
            {viewMode === "table" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting">Waiting / Review</option>
                <option value="completed">Completed</option>
              </select>
            )}

            {(searchQuery || categoryFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all" || urgentOnly) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setPriorityFilter("all");
                  setStatusFilter("all");
                  setUrgentOnly(false);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-slate-50/80 rounded-xl border border-slate-200 p-3.5 space-y-3 min-h-[500px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <h3 className="font-bold text-sm text-slate-900">{col.label}</h3>
                    <span className="px-2 py-0.2 text-xs font-semibold rounded-full bg-white border border-slate-200 text-slate-600">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={onOpenNewTask}
                    title={`Add task to ${col.label}`}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Tasks */}
                <div className="space-y-3 flex-1">
                  {colTasks.map((task) => {
                    const priorityBadge = getPriorityBadge(task.priority);
                    const categoryBadge = getCategoryBadge(task.category);
                    const overdue = isOverdue(task.dueDate, task.status);
                    const completedSubtasks = task.checklist.filter((c) => c.completed).length;

                    return (
                      <div
                        key={task.id}
                        className={`bg-white rounded-lg border transition-all p-3.5 shadow-2xs hover:shadow-sm space-y-2.5 ${
                          task.status === "completed"
                            ? "border-slate-200 opacity-80"
                            : overdue
                            ? "border-rose-300 bg-rose-50/20"
                            : "border-slate-200 hover:border-indigo-300"
                        }`}
                      >
                        {/* Tags Header */}
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded border ${priorityBadge.bg} ${priorityBadge.text}`}
                          >
                            {priorityBadge.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-medium rounded border ${categoryBadge.bg} ${categoryBadge.text}`}
                          >
                            {categoryBadge.label}
                          </span>
                        </div>

                        {/* Title */}
                        <button
                          onClick={() => onSelectTask(task)}
                          className={`text-left font-bold text-sm leading-snug cursor-pointer transition-colors block w-full hover:text-indigo-600 ${
                            task.status === "completed" ? "line-through text-slate-400" : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </button>

                        {/* Student / Care Plan tag */}
                        {task.studentName && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span>{task.studentName}</span>
                          </div>
                        )}

                        {/* Checklist preview */}
                        {task.checklist.length > 0 && (
                          <div className="bg-slate-50 p-2 rounded-md border border-slate-100 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span className="font-medium">Subtask Checklist</span>
                              <span>
                                {completedSubtasks}/{task.checklist.length}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{
                                  width: `${(completedSubtasks / task.checklist.length) * 100}%`,
                                }}
                              />
                            </div>
                            {/* Checklist first item toggle */}
                            <div className="pt-0.5">
                              {task.checklist.slice(0, 2).map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => onToggleChecklistItem(task.id, item.id)}
                                  className="flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-indigo-600 text-left w-full truncate py-0.5 cursor-pointer"
                                >
                                  <div
                                    className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${
                                      item.completed
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : "border-slate-300"
                                    }`}
                                  >
                                    {item.completed && <CheckSquare className="w-2.5 h-2.5" />}
                                  </div>
                                  <span className={item.completed ? "line-through text-slate-400" : ""}>
                                    {item.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer info: Due Date, Assignee, Status actions */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div
                            className={`flex items-center gap-1 font-medium ${
                              overdue ? "text-rose-600 font-semibold" : "text-slate-500"
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(task.dueDate)}</span>
                            {overdue && <span className="text-[10px] text-rose-600">(Overdue)</span>}
                          </div>

                          {/* Quick status cycle or complete */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMarkComplete(task.id, task.status)}
                              title={task.status === "completed" ? "Mark incomplete" : "Mark completed"}
                              className={`p-1 rounded hover:bg-slate-100 cursor-pointer transition-colors ${
                                task.status === "completed" ? "text-emerald-600 font-bold" : "text-slate-400 hover:text-emerald-600"
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>

                            {/* Dropdown to advance status */}
                            <select
                              value={task.status}
                              onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                              className="text-[10px] font-medium bg-transparent text-slate-500 border-0 p-0 cursor-pointer focus:outline-none"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="waiting">Waiting</option>
                              <option value="completed">Done</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-xs text-slate-400">
                      No tasks in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table / List View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-10"></th>
                  <th className="py-3.5 px-4">Task & Description</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Domain</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTasks.map((task) => {
                  const priorityBadge = getPriorityBadge(task.priority);
                  const categoryBadge = getCategoryBadge(task.category);
                  const statusBadge = getStatusBadge(task.status);
                  const overdue = isOverdue(task.dueDate, task.status);

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => onSelectTask(task)}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleMarkComplete(task.id, task.status)}
                          className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                            task.status === "completed"
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 hover:border-indigo-600 text-transparent"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <p className={`font-semibold text-slate-900 ${task.status === "completed" ? "line-through text-slate-400" : ""}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {task.studentName || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${categoryBadge.bg} ${categoryBadge.text}`}>
                          {categoryBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${priorityBadge.bg} ${priorityBadge.text}`}>
                          {priorityBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                          className={`text-xs font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${statusBadge.bg}`}
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="waiting">Waiting</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-xs font-medium ${overdue ? "text-rose-600 font-bold" : "text-slate-600"}`}>
                          {formatDate(task.dueDate)}
                          {overdue && " (Overdue)"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {task.assignee}
                      </td>
                    </tr>
                  );
                })}

                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                      No matching tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
