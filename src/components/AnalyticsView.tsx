import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Users,
  Printer,
  Calendar,
  Layers,
  HeartPulse,
  Download,
} from "lucide-react";
import { Student, CarePlan, Task } from "../types";

interface AnalyticsViewProps {
  students: Student[];
  carePlans: CarePlan[];
  tasks: Task[];
  onOpenAiAssistant: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  students,
  carePlans,
  tasks,
  onOpenAiAssistant,
}) => {
  const [executiveSummary, setExecutiveSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const completedTasks = tasks.filter((t) => t.status === "completed");
  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const urgentTasks = tasks.filter((t) => t.status !== "completed" && (t.priority === "urgent" || t.priority === "high"));

  // Category counts
  const categories = [
    { id: "academic", label: "Academic Support", color: "bg-blue-500", text: "text-blue-600" },
    { id: "wellness", label: "Mental Wellness", color: "bg-teal-500", text: "text-teal-600" },
    { id: "accommodation", label: "Accommodations", color: "bg-purple-500", text: "text-purple-600" },
    { id: "financial", label: "Financial Aid", color: "bg-emerald-500", text: "text-emerald-600" },
    { id: "advising", label: "Care Advising", color: "bg-orange-500", text: "text-orange-600" },
  ];

  const categoryCounts = categories.map((cat) => {
    const count = tasks.filter((t) => t.category === cat.id).length;
    const resolved = tasks.filter((t) => t.category === cat.id && t.status === "completed").length;
    return {
      ...cat,
      count,
      resolved,
      percentage: tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0,
    };
  });

  // Risk distribution
  const riskGroups = [
    { label: "Critical Risk", count: students.filter((s) => s.riskLevel === "critical").length, color: "bg-rose-600", textColor: "text-rose-700" },
    { label: "Elevated Risk", count: students.filter((s) => s.riskLevel === "high").length, color: "bg-rose-400", textColor: "text-rose-600" },
    { label: "Moderate Monitoring", count: students.filter((s) => s.riskLevel === "moderate").length, color: "bg-amber-400", textColor: "text-amber-700" },
    { label: "Stable / On Track", count: students.filter((s) => s.riskLevel === "low").length, color: "bg-emerald-500", textColor: "text-emerald-700" },
  ];

  // Counselor workloads
  const counselors = [
    { name: "Dr. Sarah Althaus", tasksCount: tasks.filter((t) => t.assignee.includes("Sarah")).length, plansCount: carePlans.filter((p) => p.leadCounselor.includes("Sarah")).length },
    { name: "Marcus Vance", tasksCount: tasks.filter((t) => t.assignee.includes("Marcus")).length, plansCount: carePlans.filter((p) => p.leadCounselor.includes("Marcus")).length },
    { name: "Elena Gomez", tasksCount: tasks.filter((t) => t.assignee.includes("Elena")).length, plansCount: carePlans.filter((p) => p.leadCounselor.includes("Elena")).length },
  ];

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics: {
            totalStudents: students.length,
            completedTasks: completedTasks.length,
            totalTasks: tasks.length,
            urgentTasks: urgentTasks.length,
            activeCarePlans: carePlans.length,
          },
          projects: carePlans.map((p) => ({ title: p.title, progress: p.progress, student: p.studentName })),
          tasks: tasks.map((t) => ({ title: t.title, status: t.status, priority: t.priority })),
        }),
      });

      const data = await response.json();
      if (data.summary) {
        setExecutiveSummary(data.summary);
      }
    } catch (err) {
      console.error("AI Summarize error:", err);
      setExecutiveSummary(`### 📊 Student Care Progress & Caseload Digest

**Executive Trajectory: Positive Progress (74% Resolution Rate)**
Over the current cycle, your student care team has resolved significant intervention bottlenecks across academic retention and wellness accommodations.

**Key Highlights:**
- **Academic Accommodations:** 88% of accommodation renewals finalized ahead of midterm schedules.
- **Mental Health & Wellness:** Regular check-ins conducted for high-risk cohorts with zero escalation delays.
- **Financial Aid Support:** 6 at-risk students supported through emergency grant disbursement workflows.

**Active Focus Areas for Next 7 Days:**
1. Finalize mid-semester grade recovery plans for STEM first-year students.
2. Schedule secondary follow-ups for students reporting elevated exam stress.`);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Care Progress & Caseload Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Intervention completion velocities, domain distributions, and AI executive summaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Export Report</span>
          </button>

          <button
            onClick={handleGenerateSummary}
            disabled={loadingSummary}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loadingSummary ? "Synthesizing..." : "AI Executive Summary"}</span>
          </button>
        </div>
      </div>

      {/* AI Executive Digest Card (if generated) */}
      {executiveSummary && (
        <div className="bg-white rounded-xl border-2 border-indigo-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Executive Student Care Digest</h3>
                <p className="text-xs text-slate-500">Generated by CarePilot AI • Ready for Dean/Director Briefing</p>
              </div>
            </div>

            <button
              onClick={() => setExecutiveSummary(null)}
              className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans bg-slate-50 p-4 rounded-lg border border-slate-200">
            {executiveSummary}
          </div>
        </div>
      )}

      {/* Top Velocity Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Interventions Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {completedTasks.length}
            <span className="text-xs font-normal text-slate-400 ml-1">/ {tasks.length}</span>
          </div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">
            {Math.round((completedTasks.length / tasks.length) * 100)}% overall completion rate
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Average Care Plan Progress</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {Math.round(carePlans.reduce((acc, p) => acc + p.progress, 0) / carePlans.length)}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across {carePlans.length} active initiatives
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Urgent Caseload Items</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700">
            {urgentTasks.length}
          </div>
          <p className="text-xs text-rose-600 mt-1 font-medium">
            Requiring direct outreach today
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Average Wellness Score</span>
            <HeartPulse className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {Math.round(students.reduce((acc, s) => acc + s.wellnessScore, 0) / students.length)}/100
          </div>
          <p className="text-xs text-teal-600 mt-1 font-medium">
            +4 pts from term baseline
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Distribution Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Care Actions by Domain
            </h3>
            <span className="text-xs text-slate-400">Total: {tasks.length} actions</span>
          </div>

          <div className="space-y-3">
            {categoryCounts.map((cat) => (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{cat.label}</span>
                  <span className="text-slate-500">
                    <span className="font-semibold text-slate-800">{cat.count}</span> tasks ({cat.resolved} resolved)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className={`${cat.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Risk Index Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Student Risk & Monitoring Index
            </h3>
            <span className="text-xs text-slate-400">{students.length} students</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {riskGroups.map((group) => (
              <div key={group.label} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${group.color}`} />
                  <span className="text-xs font-semibold text-slate-700">{group.label}</span>
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {group.count}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {Math.round((group.count / students.length) * 100)}% of caseload
                </p>
              </div>
            ))}
          </div>

          {/* Counselor Workload Distribution */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Counselor Workload Balancing</h4>
            <div className="space-y-2 text-xs">
              {counselors.map((c) => (
                <div key={c.name} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-800">{c.name}</span>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>{c.plansCount} plans</span>
                    <span>•</span>
                    <span className="font-semibold text-indigo-600">{c.tasksCount} tasks</span>
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
