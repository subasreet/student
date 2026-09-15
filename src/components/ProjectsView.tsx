import React, { useState } from "react";
import {
  Layers,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  UserCheck,
  CheckSquare,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { CarePlan, Task, Student } from "../types";
import { getCategoryBadge, formatDate } from "../utils/helpers";

interface ProjectsViewProps {
  carePlans: CarePlan[];
  tasks: Task[];
  students: Student[];
  onOpenNewPlan: () => void;
  onSelectPlan: (plan: CarePlan) => void;
  onToggleMilestone: (planId: string, milestoneId: string) => void;
  onSelectTask: (task: Task) => void;
  onGenerateTasksWithAi: (plan: CarePlan) => void;
  aiGeneratingPlanId: string | null;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  carePlans,
  tasks,
  students,
  onOpenNewPlan,
  onSelectPlan,
  onToggleMilestone,
  onSelectTask,
  onGenerateTasksWithAi,
  aiGeneratingPlanId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredPlans = carePlans.filter((p) => {
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Student Care Plans & Projects</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              {carePlans.length} Active Plans
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Structured intervention initiatives, accommodations, and academic recovery roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Care Domains</option>
            <option value="academic">Academic Support</option>
            <option value="wellness">Mental Wellness</option>
            <option value="accommodation">Accommodations</option>
            <option value="financial">Financial Aid</option>
            <option value="advising">Advising & Guidance</option>
          </select>

          <button
            onClick={onOpenNewPlan}
            id="projects-create-plan-btn"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Care Plan</span>
          </button>
        </div>
      </div>

      {/* Plans List / Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlans.map((plan) => {
          const categoryBadge = getCategoryBadge(plan.category);
          const planTasks = tasks.filter((t) => t.planId === plan.id);
          const completedMilestones = plan.milestones.filter((m) => m.completed).length;
          const isGeneratingAi = aiGeneratingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs p-5 space-y-4 transition-all"
            >
              {/* Header: Category, Status, Action */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${categoryBadge.bg} ${categoryBadge.text}`}>
                      {categoryBadge.label}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-md">
                      Lead: {plan.leadCounselor}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectPlan(plan)}
                    className="font-bold text-slate-900 text-base hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {plan.title}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xl font-extrabold text-indigo-600">
                    {plan.progress}%
                  </span>
                  <p className="text-[11px] text-slate-400">Target Progress</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {plan.description}
              </p>

              {/* Student & Date metadata */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <UserCheck className="w-4 h-4 text-indigo-500" />
                  <span>Student: {plan.studentName}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target: {formatDate(plan.targetDate)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </div>

              {/* Key Milestones Interactive Section */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    Care Milestones ({completedMilestones}/{plan.milestones.length})
                  </span>
                </div>

                <div className="space-y-1.5">
                  {plan.milestones.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onToggleMilestone(plan.id, m.id)}
                      className="flex items-center gap-2 text-left w-full text-xs text-slate-700 hover:text-indigo-600 py-1 transition-colors cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          m.completed
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 bg-white group-hover:border-indigo-500"
                        }`}
                      >
                        {m.completed && <CheckSquare className="w-3 h-3" />}
                      </div>
                      <span className={m.completed ? "line-through text-slate-400" : "font-medium text-slate-800"}>
                        {m.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Associated Tasks & AI Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">{planTasks.length}</span> linked tasks (
                  {planTasks.filter((t) => t.status === "completed").length} resolved)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onGenerateTasksWithAi(plan)}
                    disabled={isGeneratingAi}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isGeneratingAi ? "Generating..." : "AI Generate Tasks"}</span>
                  </button>

                  <button
                    onClick={() => onSelectPlan(plan)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Plan Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPlans.length === 0 && (
          <div className="col-span-2 text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 p-8">
            <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No care plans found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create an intervention roadmap or select a different category filter.
            </p>
            <button
              onClick={onOpenNewPlan}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              + Create First Care Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
