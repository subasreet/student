import React from "react";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  ArrowUpRight,
  Clock,
  Sparkles,
  ChevronRight,
  CheckSquare,
  Plus,
  Flame,
  FileText,
  Calendar,
  Layers,
} from "lucide-react";
import { Student, CarePlan, Task, CareActivity } from "../types";
import { getPriorityBadge, getCategoryBadge, formatDate } from "../utils/helpers";

interface DashboardViewProps {
  students: Student[];
  carePlans: CarePlan[];
  tasks: Task[];
  activities: CareActivity[];
  onToggleTaskStatus: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onSelectPlan: (plan: CarePlan) => void;
  onSelectStudent: (student: Student) => void;
  onOpenNewTask: () => void;
  onOpenNewPlan: () => void;
  onOpenAiChat: () => void;
  onNavigateToTab: (tab: "tasks" | "projects" | "priorities" | "analytics" | "assistant") => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  carePlans,
  tasks,
  activities,
  onToggleTaskStatus,
  onSelectTask,
  onSelectPlan,
  onSelectStudent,
  onOpenNewTask,
  onOpenNewPlan,
  onOpenAiChat,
  onNavigateToTab,
}) => {
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const urgentTasks = tasks.filter((t) => t.status !== "completed" && (t.priority === "urgent" || t.priority === "high"));
  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const criticalStudents = students.filter((s) => s.riskLevel === "critical" || s.riskLevel === "high");

  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const avgWellness = students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.wellnessScore, 0) / students.length) : 75;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Student Care Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Overview of active student interventions, urgent tasks, and wellness metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigateToTab("priorities")}
            id="dashboard-priorities-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Priority Matrix</span>
          </button>

          <button
            onClick={onOpenNewPlan}
            id="dashboard-new-plan-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4 text-slate-600" />
            <span>New Care Plan</span>
          </button>

          <button
            onClick={onOpenNewTask}
            id="dashboard-new-task-btn"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Critical Care Alert Banner */}
      {criticalStudents.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rose-900">
                  Critical Intervention Attention Required
                </span>
                <span className="px-2 py-0.2 text-xs font-semibold bg-rose-200 text-rose-800 rounded-full">
                  {criticalStudents.length} Students Flagged
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-700 mt-0.5">
                {criticalStudents.map((s) => s.name).join(", ")} have elevated risk flags requiring advisor follow-up today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onSelectStudent(criticalStudents[0])}
              className="flex-1 md:flex-initial px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded-lg transition-colors cursor-pointer"
            >
              Review {criticalStudents[0].name.split(" ")[0]}
            </button>
            <button
              onClick={onOpenAiChat}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Triage Plan</span>
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Students</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{students.length}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              100% active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Across 5 major departments</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Urgent Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{urgentTasks.length}</span>
            <span className="text-xs font-medium text-rose-600">Need resolution</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{pendingTasks.length} total pending tasks</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Task Completion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{completionRate}%</span>
            <span className="text-xs font-medium text-emerald-600">
              {completedTasks.length}/{tasks.length} done
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Avg Wellness Index</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{avgWellness}/100</span>
            <span className="text-xs font-medium text-teal-600">Cohort Average</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Based on weekly check-ins</p>
        </div>
      </div>

      {/* Main Grid: Urgent Tasks + Active Care Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Tasks to Tackle */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-slate-900 text-base">
                  High-Priority Care Actions
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                  {urgentTasks.length} active
                </span>
              </div>
              <button
                onClick={() => onNavigateToTab("tasks")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                View all tasks
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tasks List */}
            <div className="space-y-2.5">
              {urgentTasks.slice(0, 4).map((task) => {
                const priorityBadge = getPriorityBadge(task.priority);
                const categoryBadge = getCategoryBadge(task.category);
                const completedSubtasks = task.checklist.filter((c) => c.completed).length;

                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => onToggleTaskStatus(task.id)}
                        title="Mark as completed"
                        className="mt-0.5 w-5 h-5 rounded border border-slate-300 hover:border-indigo-600 flex items-center justify-center text-transparent hover:text-indigo-600 bg-white transition-colors cursor-pointer shrink-0"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${priorityBadge.bg} ${priorityBadge.text}`}
                          >
                            {priorityBadge.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[11px] font-medium rounded-md border ${categoryBadge.bg} ${categoryBadge.text}`}
                          >
                            {categoryBadge.label}
                          </span>
                          {task.studentName && (
                            <span className="text-xs text-slate-500 font-medium truncate">
                              • Student: {task.studentName}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => onSelectTask(task)}
                          className="text-left font-semibold text-slate-900 hover:text-indigo-600 text-sm leading-snug line-clamp-2 cursor-pointer transition-colors"
                        >
                          {task.title}
                        </button>

                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Due {formatDate(task.dueDate)}
                          </span>

                          {task.checklist.length > 0 && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                              {completedSubtasks}/{task.checklist.length} subtasks
                            </span>
                          )}

                          <span className="text-slate-400 truncate">
                            Assignee: {task.assignee}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectTask(task)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {urgentTasks.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">All high priority tasks cleared!</p>
                  <p className="text-xs text-slate-400">Great work maintaining zero overdue intervention backlog.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Advisor Prompt Box */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-xl border border-indigo-800 shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      CarePilot AI Daily Recommendation
                    </h3>
                    <span className="text-[10px] font-semibold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full">
                      Live Copilot
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-100/80 mt-1 max-w-xl leading-relaxed">
                    Prioritize Marcus's hospital recovery accommodation letter before 12:00 PM to avoid midterm exam conflict. Also, Liam's emergency meal card was completed; follow up on tuition fee bypass.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenAiChat}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                <span>Ask CarePilot</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenAiChat}
                  className="hover:text-white underline cursor-pointer"
                >
                  ⚡ "Prioritize my urgent tasks for today"
                </button>
                <span className="hidden md:inline">•</span>
                <button
                  onClick={onOpenAiChat}
                  className="hidden md:inline hover:text-white underline cursor-pointer"
                >
                  📊 "Summarize student progress"
                </button>
              </div>

              <button
                onClick={onOpenAiChat}
                className="sm:hidden flex items-center gap-1 font-semibold text-white cursor-pointer"
              >
                Open AI Chat <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Care Plans + Activity Stream */}
        <div className="space-y-4">
          {/* Active Care Plans widget */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-base">Active Care Plans</h2>
              </div>
              <button
                onClick={() => onNavigateToTab("projects")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                View all ({carePlans.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {carePlans.slice(0, 3).map((plan) => {
                const categoryBadge = getCategoryBadge(plan.category);

                return (
                  <div
                    key={plan.id}
                    onClick={() => onSelectPlan(plan)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${categoryBadge.bg} ${categoryBadge.text}`}>
                        {categoryBadge.label}
                      </span>
                      <span className="text-xs font-bold text-indigo-600">
                        {plan.progress}%
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 line-clamp-1 transition-colors">
                      {plan.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Student: <span className="font-medium text-slate-700">{plan.studentName}</span>
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Recent Care Activity
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {activities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 leading-snug">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-slate-400 mt-0.5 text-[11px]">
                      <span>{activity.studentName}</span>
                      <span>•</span>
                      <span>{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
