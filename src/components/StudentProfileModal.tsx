import React, { useState } from "react";
import {
  X,
  HeartPulse,
  BookOpen,
  Mail,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Plus,
  Sparkles,
  Layers,
  FileText,
  UserCheck,
} from "lucide-react";
import { Student, CarePlan, Task } from "../types";
import { getRiskLevelBadge, getPriorityBadge, getCategoryBadge, formatDate } from "../utils/helpers";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  carePlans: CarePlan[];
  tasks: Task[];
  onToggleTaskStatus: (taskId: string) => void;
  onOpenNewTaskForStudent: (student: Student) => void;
  onOpenAiForStudent: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  carePlans,
  tasks,
  onToggleTaskStatus,
  onOpenNewTaskForStudent,
  onOpenAiForStudent,
}) => {
  if (!isOpen || !student) return null;

  const studentTasks = tasks.filter((t) => t.studentId === student.id);
  const activePlan = carePlans.find((p) => p.studentId === student.id);
  const riskBadge = getRiskLevelBadge(student.riskLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Profile Hero */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/30 shadow-md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {student.name}
                </h2>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${riskBadge.bg} ${riskBadge.text}`}>
                  {riskBadge.label}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                {student.studentNumber} • {student.year} • {student.major}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {student.email}
                </span>
                <span>Advisor: {student.advisorName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50/70 p-3 text-center">
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Cumulative GPA</span>
            <p className="text-lg font-bold text-slate-900">{student.gpa}</p>
          </div>
          <div className="border-x border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Wellness Score</span>
            <p className="text-lg font-bold text-teal-600">{student.wellnessScore}/100</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Active Tasks</span>
            <p className="text-lg font-bold text-indigo-600">{studentTasks.length}</p>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Care Flags:
            </span>
            {student.tags.map((t) => (
              <span
                key={t}
                className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Active Care Plan */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Active Intervention Plan
              </h3>
              {activePlan && (
                <span className="text-xs font-extrabold text-indigo-600">
                  {activePlan.progress}% Completed
                </span>
              )}
            </div>

            {activePlan ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-900">{activePlan.title}</p>
                <p className="text-xs text-slate-600">{activePlan.description}</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${activePlan.progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No active care plan assigned.</p>
            )}
          </div>

          {/* Tasks for this student */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Assigned Care Actions ({studentTasks.length})
              </h3>

              <button
                onClick={() => {
                  onOpenNewTaskForStudent(student);
                  onClose();
                }}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="space-y-2">
              {studentTasks.map((t) => {
                const priorityBadge = getPriorityBadge(t.priority);
                const categoryBadge = getCategoryBadge(t.category);

                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleTaskStatus(t.id)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                          t.status === "completed"
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {t.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${priorityBadge.bg} ${priorityBadge.text}`}>
                            {priorityBadge.label}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[10px] font-medium rounded ${categoryBadge.bg} ${categoryBadge.text}`}>
                            {categoryBadge.label}
                          </span>
                        </div>
                        <p className={`font-semibold text-slate-900 ${t.status === "completed" ? "line-through text-slate-400" : ""}`}>
                          {t.title}
                        </p>
                      </div>
                    </div>

                    <span className="text-slate-400 whitespace-nowrap">
                      {formatDate(t.dueDate)}
                    </span>
                  </div>
                );
              })}

              {studentTasks.length === 0 && (
                <p className="text-xs text-slate-400 italic py-3 text-center">
                  No tasks currently logged for this student.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              onOpenAiForStudent(student);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Care Strategy for {student.name.split(" ")[0]}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
