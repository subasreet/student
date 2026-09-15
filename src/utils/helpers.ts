import { PriorityLevel, TaskStatus, CareCategory } from "../types";

export function getPriorityBadge(priority: PriorityLevel): { label: string; bg: string; text: string; dot: string } {
  switch (priority) {
    case "urgent":
      return { label: "Urgent", bg: "bg-rose-50 border-rose-200", text: "text-rose-700", dot: "bg-rose-500 animate-pulse" };
    case "high":
      return { label: "High", bg: "bg-amber-50 border-amber-200", text: "text-amber-800", dot: "bg-amber-500" };
    case "medium":
      return { label: "Medium", bg: "bg-sky-50 border-sky-200", text: "text-sky-700", dot: "bg-sky-500" };
    case "low":
      return { label: "Low", bg: "bg-slate-100 border-slate-200", text: "text-slate-600", dot: "bg-slate-400" };
  }
}

export function getStatusBadge(status: TaskStatus): { label: string; bg: string; text: string } {
  switch (status) {
    case "todo":
      return { label: "To Do", bg: "bg-slate-100 text-slate-700 border-slate-200", text: "text-slate-700" };
    case "in_progress":
      return { label: "In Progress", bg: "bg-indigo-50 text-indigo-700 border-indigo-200", text: "text-indigo-700" };
    case "waiting":
      return { label: "Waiting / Review", bg: "bg-amber-50 text-amber-800 border-amber-200", text: "text-amber-800" };
    case "completed":
      return { label: "Completed", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700" };
  }
}

export function getCategoryBadge(category: CareCategory): { label: string; bg: string; text: string } {
  switch (category) {
    case "academic":
      return { label: "Academic", bg: "bg-blue-50 text-blue-700 border-blue-200", text: "text-blue-700" };
    case "wellness":
      return { label: "Wellness & Health", bg: "bg-teal-50 text-teal-700 border-teal-200", text: "text-teal-700" };
    case "financial":
      return { label: "Financial Aid", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700" };
    case "accommodation":
      return { label: "Accommodations", bg: "bg-purple-50 text-purple-700 border-purple-200", text: "text-purple-700" };
    case "advising":
      return { label: "Care Advising", bg: "bg-orange-50 text-orange-700 border-orange-200", text: "text-orange-700" };
  }
}

export function getRiskLevelBadge(risk: "low" | "moderate" | "high" | "critical"): { label: string; bg: string; text: string; dot: string } {
  switch (risk) {
    case "critical":
      return { label: "Critical Priority", bg: "bg-rose-100 text-rose-800 border-rose-300", text: "text-rose-800", dot: "bg-rose-600 animate-ping" };
    case "high":
      return { label: "Elevated Risk", bg: "bg-rose-50 text-rose-700 border-rose-200", text: "text-rose-700", dot: "bg-rose-500" };
    case "moderate":
      return { label: "Moderate Monitoring", bg: "bg-amber-50 text-amber-800 border-amber-200", text: "text-amber-800", dot: "bg-amber-500" };
    case "low":
      return { label: "Stable / On Track", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" };
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return "No date";
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function isOverdue(dateString: string, status: TaskStatus): boolean {
  if (status === "completed" || !dateString) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateString < today;
}
