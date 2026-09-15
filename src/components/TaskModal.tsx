import React, { useState, useEffect } from "react";
import { X, Sparkles, Plus, Trash2, CheckCircle2, Calendar, User, Layers, Tag } from "lucide-react";
import { Task, CareCategory, PriorityLevel, TaskStatus, Student, CarePlan, ChecklistItem } from "../types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (taskData: Omit<Task, "id" | "createdAt"> & { id?: string }) => void;
  onDeleteTask?: (taskId: string) => void;
  initialTask?: Task | null;
  students: Student[];
  carePlans: CarePlan[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  onDeleteTask,
  initialTask,
  students,
  carePlans,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CareCategory>("academic");
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [studentId, setStudentId] = useState("");
  const [planId, setPlanId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("Dr. Sarah Althaus");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || "");
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setStudentId(initialTask.studentId || "");
      setPlanId(initialTask.planId || "");
      setDueDate(initialTask.dueDate);
      setAssignee(initialTask.assignee);
      setChecklist(initialTask.checklist || []);
      setTags(initialTask.tags || []);
    } else {
      setTitle("");
      setDescription("");
      setCategory("academic");
      setPriority("medium");
      setStatus("todo");
      setStudentId(students[0]?.id || "");
      setPlanId("");
      setDueDate(new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]);
      setAssignee("Dr. Sarah Althaus");
      setChecklist([]);
      setTags(["Student Care"]);
    }
  }, [initialTask, isOpen, students]);

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist([
      ...checklist,
      { id: `c-${Date.now()}`, text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText("");
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist(checklist.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c)));
  };

  const handleDeleteChecklist = (id: string) => {
    setChecklist(checklist.filter((c) => c.id !== id));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAiSuggestSubtasks = () => {
    const defaultSteps = [
      "Review student case file and recent semester notes",
      "Schedule confidential 1-on-1 counseling session",
      "Coordinate with academic advisor & relevant instructor",
      "Send follow-up action summary & log in student file",
    ];

    const newItems: ChecklistItem[] = defaultSteps.map((step, idx) => ({
      id: `ai-step-${Date.now()}-${idx}`,
      text: step,
      completed: false,
    }));

    setChecklist([...checklist, ...newItems]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedStudent = students.find((s) => s.id === studentId);
    const selectedPlan = carePlans.find((p) => p.id === planId);

    onSaveTask({
      id: initialTask?.id,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status,
      studentId: selectedStudent?.id,
      studentName: selectedStudent?.name,
      planId: selectedPlan?.id,
      planTitle: selectedPlan?.title,
      dueDate,
      assignee,
      checklist,
      tags,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialTask ? "Edit Care Task" : "Create New Care Task"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify intervention steps, student assignment, and priority level.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule emergency academic counseling session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Care Notes & Context
            </label>
            <textarea
              rows={2}
              placeholder="Provide context, clinical/academic rationale, or specific student needs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category & Priority Grid */}
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
                <option value="accommodation">Accommodation Services</option>
                <option value="financial">Financial Aid</option>
                <option value="advising">Care Advising</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="urgent">🔴 Urgent (Immediate Triage)</option>
                <option value="high">🟡 High (Schedule Today)</option>
                <option value="medium">🔵 Medium (Operational)</option>
                <option value="low">⚪ Low (Routine)</option>
              </select>
            </div>
          </div>

          {/* Status & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Task Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting">Waiting / Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Student & Care Plan Association */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Student
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="">None / General Caseload</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.major.split(" ")[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Linked Care Plan (Project)
              </label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="">Standalone Task</option>
                {carePlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.studentName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Lead Counselor / Assignee
            </label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="Dr. Sarah Althaus">Dr. Sarah Althaus (Lead Academic Advisor)</option>
              <option value="Marcus Vance">Marcus Vance (Disability & Health Specialist)</option>
              <option value="Elena Gomez">Elena Gomez (Financial Aid & Basic Needs)</option>
            </select>
          </div>

          {/* Subtask Checklist */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Action Checklist ({checklist.filter((c) => c.completed).length}/{checklist.length})
              </label>
              <button
                type="button"
                onClick={handleAiSuggestSubtasks}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Suggest Steps</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2 rounded bg-slate-50 border border-slate-200 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleChecklist(item.id)}
                    className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        item.completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300"
                      }`}
                    >
                      {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className={item.completed ? "line-through text-slate-400" : "text-slate-800 font-medium truncate"}>
                      {item.text}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteChecklist(item.id)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add checklist input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add subtask step..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tags
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add tag (e.g. Exam Relief, Clinic)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                + Tag
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {initialTask && onDeleteTask ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteTask(initialTask.id);
                  onClose();
                }}
                className="px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
              >
                Delete Task
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
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
                {initialTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
