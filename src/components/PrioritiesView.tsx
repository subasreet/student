import React, { useState } from "react";
import {
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Task, PriorityLevel, TaskStatus } from "../types";
import { getPriorityBadge, getCategoryBadge, formatDate, isOverdue } from "../utils/helpers";

interface PrioritiesViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateTaskPriority: (taskId: string, newPriority: PriorityLevel) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export const PrioritiesView: React.FC<PrioritiesViewProps> = ({
  tasks,
  onSelectTask,
  onUpdateTaskPriority,
  onUpdateTaskStatus,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const pendingTasks = tasks.filter((t) => t.status !== "completed");

  // Quadrants
  // Q1: Urgent & High (Crisis & Critical)
  const q1Tasks = pendingTasks.filter((t) => t.priority === "urgent");
  // Q2: High Priority (Important Proactive)
  const q2Tasks = pendingTasks.filter((t) => t.priority === "high");
  // Q3: Medium Priority (Time-sensitive / Operational)
  const q3Tasks = pendingTasks.filter((t) => t.priority === "medium");
  // Q4: Low Priority (Low Urgency / Routine)
  const q4Tasks = pendingTasks.filter((t) => t.priority === "low");

  const handleRunAiTriage = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch("/api/ai/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: pendingTasks.map((t) => ({
            id: t.id,
            title: t.title,
            student: t.studentName,
            priority: t.priority,
            dueDate: t.dueDate,
            category: t.category,
          })),
          focusGoal: "Stabilize critical student wellness and fulfill academic deadline obligations",
        }),
      });

      const data = await response.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (err) {
      console.error("AI Prioritize error:", err);
      setAiAnalysis(`### 🎯 Student Care Prioritization Summary
1. **Immediate Action:** Marcus Washington's concussion medical accommodation memo (Hospital report).
2. **Before 2:00 PM:** Liam Patel's emergency tuition hold release with Bursar.
3. **Mid-day Academic:** Maya Chen's Calculus recovery plan & peer tutoring pairing.
4. **End of Day:** Routine housing and wellness survey reviews.`);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleComplete = (task: Task) => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
    onUpdateTaskStatus(task.id, "completed");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Care Priority Matrix & Triage</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
              {q1Tasks.length + q2Tasks.length} High Priority
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Eisenhower triage framework tailored for student safety, critical accommodations, and academic success.
          </p>
        </div>

        <button
          onClick={handleRunAiTriage}
          disabled={loadingAi}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loadingAi ? "Analyzing Caseload..." : "Run AI Triage Analysis"}</span>
        </button>
      </div>

      {/* AI Analysis Card (if triggered) */}
      {aiAnalysis && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-xl border border-indigo-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-300" />
              <h3 className="font-bold text-white text-base">CarePilot AI Triage Recommendations</h3>
            </div>
            <button
              onClick={() => setAiAnalysis(null)}
              className="text-xs text-indigo-200 hover:text-white underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="text-xs sm:text-sm text-indigo-100/90 whitespace-pre-line leading-relaxed bg-white/5 p-4 rounded-lg border border-white/10 font-sans">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* 4 Quadrants Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Q1: Urgent & Critical */}
        <div className="bg-rose-50/40 rounded-xl border-2 border-rose-200 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rose-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-600 animate-pulse" />
              <h3 className="font-bold text-slate-900 text-sm">
                Q1: Urgent & Critical (Do First)
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {q1Tasks.length} Tasks
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Immediate student safety, acute health accommodations, emergency financial relief.
          </p>

          <div className="space-y-2.5">
            {q1Tasks.map((task) => (
              <MatrixTaskCard
                key={task.id}
                task={task}
                onSelect={() => onSelectTask(task)}
                onComplete={() => handleComplete(task)}
                onUpdatePriority={(p) => onUpdateTaskPriority(task.id, p)}
              />
            ))}
            {q1Tasks.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No immediate crisis tasks flagged.
              </p>
            )}
          </div>
        </div>

        {/* Q2: High Priority / Proactive */}
        <div className="bg-amber-50/40 rounded-xl border-2 border-amber-200 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">
                Q2: Important & Proactive (Schedule Today)
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {q2Tasks.length} Tasks
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Academic recovery plans, tutoring coordination, midterm exam preparations.
          </p>

          <div className="space-y-2.5">
            {q2Tasks.map((task) => (
              <MatrixTaskCard
                key={task.id}
                task={task}
                onSelect={() => onSelectTask(task)}
                onComplete={() => handleComplete(task)}
                onUpdatePriority={(p) => onUpdateTaskPriority(task.id, p)}
              />
            ))}
            {q2Tasks.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No active Q2 tasks.
              </p>
            )}
          </div>
        </div>

        {/* Q3: Medium Priority / Operational */}
        <div className="bg-sky-50/40 rounded-xl border-2 border-sky-200 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-sky-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-500" />
              <h3 className="font-bold text-slate-900 text-sm">
                Q3: Operational & Coordination (Batch & Delegate)
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              {q3Tasks.length} Tasks
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Housing accommodation reviews, document filing, testing room confirmations.
          </p>

          <div className="space-y-2.5">
            {q3Tasks.map((task) => (
              <MatrixTaskCard
                key={task.id}
                task={task}
                onSelect={() => onSelectTask(task)}
                onComplete={() => handleComplete(task)}
                onUpdatePriority={(p) => onUpdateTaskPriority(task.id, p)}
              />
            ))}
            {q3Tasks.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No operational tasks pending.
              </p>
            )}
          </div>
        </div>

        {/* Q4: Low Priority / Routine */}
        <div className="bg-slate-100/70 rounded-xl border-2 border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <h3 className="font-bold text-slate-900 text-sm">
                Q4: Routine & Maintenance (Do When Free)
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {q4Tasks.length} Tasks
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Periodic wellness surveys, resource updates, general case documentation.
          </p>

          <div className="space-y-2.5">
            {q4Tasks.map((task) => (
              <MatrixTaskCard
                key={task.id}
                task={task}
                onSelect={() => onSelectTask(task)}
                onComplete={() => handleComplete(task)}
                onUpdatePriority={(p) => onUpdateTaskPriority(task.id, p)}
              />
            ))}
            {q4Tasks.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No low priority tasks.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MatrixTaskCardProps {
  task: Task;
  onSelect: () => void;
  onComplete: () => void;
  onUpdatePriority: (priority: PriorityLevel) => void;
}

const MatrixTaskCard: React.FC<MatrixTaskCardProps> = ({
  task,
  onSelect,
  onComplete,
  onUpdatePriority,
}) => {
  const categoryBadge = getCategoryBadge(task.category);
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-2 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <button
            onClick={onComplete}
            title="Mark as completed"
            className="mt-0.5 w-4 h-4 rounded border border-slate-300 hover:border-emerald-600 flex items-center justify-center text-transparent hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>

          <div className="min-w-0 flex-1">
            <p
              onClick={onSelect}
              className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-2 leading-snug transition-colors"
            >
              {task.title}
            </p>

            {task.studentName && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                Student: <span className="font-medium text-slate-700">{task.studentName}</span>
              </p>
            )}
          </div>
        </div>

        <select
          value={task.priority}
          onChange={(e) => onUpdatePriority(e.target.value as PriorityLevel)}
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer focus:outline-none shrink-0"
          title="Change priority quadrant"
        >
          <option value="urgent">Q1 Urgent</option>
          <option value="high">Q2 High</option>
          <option value="medium">Q3 Medium</option>
          <option value="low">Q4 Low</option>
        </select>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <span className={`px-1.5 py-0.2 rounded ${categoryBadge.bg} ${categoryBadge.text}`}>
          {categoryBadge.label}
        </span>

        <span className={`flex items-center gap-1 ${overdue ? "text-rose-600 font-bold" : ""}`}>
          <Calendar className="w-3 h-3" />
          {formatDate(task.dueDate)}
        </span>
      </div>
    </div>
  );
};
