import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Layers, Calendar, User, TrendingUp } from "lucide-react";
import { CarePlan, CareCategory, Student, CarePlanMilestone } from "../types";

interface CarePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlan: (planData: Omit<CarePlan, "id" | "progress"> & { id?: string }) => void;
  initialPlan?: CarePlan | null;
  students: Student[];
}

export const CarePlanModal: React.FC<CarePlanModalProps> = ({
  isOpen,
  onClose,
  onSavePlan,
  initialPlan,
  students,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CareCategory>("academic");
  const [studentId, setStudentId] = useState("");
  const [leadCounselor, setLeadCounselor] = useState("Dr. Sarah Althaus");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [milestones, setMilestones] = useState<CarePlanMilestone[]>([]);
  const [newMilestoneText, setNewMilestoneText] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (initialPlan) {
      setTitle(initialPlan.title);
      setDescription(initialPlan.description);
      setCategory(initialPlan.category);
      setStudentId(initialPlan.studentId);
      setLeadCounselor(initialPlan.leadCounselor);
      setStartDate(initialPlan.startDate);
      setTargetDate(initialPlan.targetDate);
      setMilestones(initialPlan.milestones || []);
      setTags(initialPlan.tags || []);
    } else {
      setTitle("");
      setDescription("");
      setCategory("academic");
      setStudentId(students[0]?.id || "");
      setLeadCounselor("Dr. Sarah Althaus");
      setStartDate(new Date().toISOString().split("T")[0]);
      setTargetDate(new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0]);
      setMilestones([
        { id: "m-init-1", title: "Complete initial intake and goal-setting assessment", completed: true },
        { id: "m-init-2", title: "Midpoint check-in and academic progress evaluation", completed: false },
        { id: "m-init-3", title: "Final care plan review and transition plan", completed: false },
      ]);
      setTags(["Intervention Plan"]);
    }
  }, [initialPlan, isOpen, students]);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setMilestones([
      ...milestones,
      { id: `m-${Date.now()}`, title: newMilestoneText.trim(), completed: false },
    ]);
    setNewMilestoneText("");
  };

  const handleToggleMilestone = (id: string) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const student = students.find((s) => s.id === studentId);

    onSavePlan({
      id: initialPlan?.id,
      title: title.trim(),
      description: description.trim(),
      category,
      studentId,
      studentName: student?.name || "Student",
      leadCounselor,
      status: initialPlan?.status || "in-progress",
      startDate,
      targetDate,
      milestones,
      tags,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialPlan ? "Edit Care Plan" : "Create Student Care Plan"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Establish multi-week care roadmaps, intervention targets, and milestones.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Care Plan Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. First-Year STEM Calculus Academic Recovery"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Care Plan Objectives & Protocol
            </label>
            <textarea
              rows={2}
              placeholder="Detail intervention scope, weekly requirements, and support resources..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Care Domain
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CareCategory)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="academic">Academic Support</option>
                <option value="wellness">Mental Wellness</option>
                <option value="accommodation">Accommodations</option>
                <option value="financial">Financial Aid</option>
                <option value="advising">Care Advising</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.major.split(" ")[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lead Counselor
              </label>
              <select
                value={leadCounselor}
                onChange={(e) => setLeadCounselor(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="Dr. Sarah Althaus">Dr. Sarah Althaus (Lead Academic Advisor)</option>
                <option value="Marcus Vance">Marcus Vance (Disability Specialist)</option>
                <option value="Elena Gomez">Elena Gomez (Basic Needs Counselor)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-2 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Milestones list */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Care Milestones ({milestones.filter((m) => m.completed).length}/{milestones.length})
            </label>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 p-2 rounded bg-slate-50 border border-slate-200 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleMilestone(m.id)}
                    className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        m.completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300"
                      }`}
                    >
                      {m.completed && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                    <span className={m.completed ? "line-through text-slate-400" : "text-slate-800 font-medium truncate"}>
                      {m.title}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteMilestone(m.id)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add milestone requirement..."
                value={newMilestoneText}
                onChange={(e) => setNewMilestoneText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMilestone();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Add Milestone
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              {initialPlan ? "Save Care Plan" : "Create Care Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
