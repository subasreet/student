import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Header } from "./components/Header";
import { Navigation, NavTab } from "./components/Navigation";
import { DashboardView } from "./components/DashboardView";
import { TaskManagementView } from "./components/TaskManagementView";
import { ProjectsView } from "./components/ProjectsView";
import { PrioritiesView } from "./components/PrioritiesView";
import { AnalyticsView } from "./components/AnalyticsView";
import { AiAssistantChat } from "./components/AiAssistantChat";
import { TaskModal } from "./components/TaskModal";
import { CarePlanModal } from "./components/CarePlanModal";
import { SearchModal } from "./components/SearchModal";
import { StudentProfileModal } from "./components/StudentProfileModal";
import {
  INITIAL_STUDENTS,
  INITIAL_CARE_PLANS,
  INITIAL_TASKS,
  INITIAL_ACTIVITIES,
} from "./data/mockData";
import { Student, CarePlan, Task, CareActivity, TaskStatus, PriorityLevel } from "./types";
import { ShieldCheck, RotateCcw } from "lucide-react";

export default function App() {
  // State with LocalStorage persistence
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("carepilot_students");
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [carePlans, setCarePlans] = useState<CarePlan[]>(() => {
    const saved = localStorage.getItem("carepilot_plans");
    return saved ? JSON.parse(saved) : INITIAL_CARE_PLANS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("carepilot_tasks");
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [activities, setActivities] = useState<CareActivity[]>(() => {
    const saved = localStorage.getItem("carepilot_activities");
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CarePlan | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<Student | null>(null);
  const [aiGeneratingPlanId, setAiGeneratingPlanId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("carepilot_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("carepilot_plans", JSON.stringify(carePlans));
  }, [carePlans]);

  useEffect(() => {
    localStorage.setItem("carepilot_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("carepilot_activities", JSON.stringify(activities));
  }, [activities]);

  // Global keydown for search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Task actions
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus: TaskStatus = t.status === "completed" ? "todo" : "completed";
          if (nextStatus === "completed") {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.7 },
            });
            // log activity
            logActivity("task-completed", t.studentName || "Caseload", `Completed task: ${t.title}`);
          }
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (newStatus === "completed" && t.status !== "completed") {
            logActivity("task-completed", t.studentName || "Caseload", `Completed task: ${t.title}`);
          }
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const handleUpdateTaskPriority = (taskId: string, newPriority: PriorityLevel) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
    );
  };

  const handleToggleChecklistItem = (taskId: string, checklistId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            checklist: t.checklist.map((c) =>
              c.id === checklistId ? { ...c, completed: !c.completed } : c
            ),
          };
        }
        return t;
      })
    );
  };

  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt"> & { id?: string }) => {
    if (taskData.id) {
      // update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskData.id
            ? {
                ...t,
                ...taskData,
                id: taskData.id,
              }
            : t
        )
      );
    } else {
      // create
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTasks((prev) => [newTask, ...prev]);
      logActivity(
        "check-in",
        taskData.studentName || "General",
        `Created care task: ${taskData.title}`
      );
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Care Plan actions
  const handleSavePlan = (planData: Omit<CarePlan, "id" | "progress"> & { id?: string }) => {
    if (planData.id) {
      setCarePlans((prev) =>
        prev.map((p) =>
          p.id === planData.id
            ? {
                ...p,
                ...planData,
                id: planData.id,
              }
            : p
        )
      );
    } else {
      const newPlan: CarePlan = {
        ...planData,
        id: `plan-${Date.now()}`,
        progress: 25,
      };
      setCarePlans((prev) => [newPlan, ...prev]);
      logActivity(
        "plan-updated",
        planData.studentName,
        `Established new care plan: ${planData.title}`
      );
    }
  };

  const handleToggleMilestone = (planId: string, milestoneId: string) => {
    setCarePlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const updatedMilestones = p.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          const completedCount = updatedMilestones.filter((m) => m.completed).length;
          const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);

          if (newProgress === 100) {
            confetti({
              particleCount: 70,
              spread: 80,
              origin: { y: 0.6 },
            });
          }

          return {
            ...p,
            milestones: updatedMilestones,
            progress: newProgress,
          };
        }
        return p;
      })
    );
  };

  // AI Task Generation for Care Plan
  const handleGenerateTasksWithAi = async (plan: CarePlan) => {
    setAiGeneratingPlanId(plan.id);
    try {
      const response = await fetch("/api/ai/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planTitle: plan.title,
          targetCategory: plan.category,
          studentName: plan.studentName,
          notes: plan.description,
        }),
      });

      const data = await response.json();
      if (Array.isArray(data.tasks) && data.tasks.length > 0) {
        const newTasks: Task[] = data.tasks.map((t: any, idx: number) => ({
          id: `task-ai-${Date.now()}-${idx}`,
          title: t.title,
          description: t.description,
          category: t.category || plan.category,
          priority: t.priority || "medium",
          status: "todo",
          studentId: plan.studentId,
          studentName: plan.studentName,
          planId: plan.id,
          planTitle: plan.title,
          dueDate: new Date(Date.now() + 86400000 * (idx + 2)).toISOString().split("T")[0],
          checklist: Array.isArray(t.checklist)
            ? t.checklist.map((c: string, cidx: number) => ({
                id: `c-ai-${Date.now()}-${idx}-${cidx}`,
                text: typeof c === "string" ? c : (c as any).text,
                completed: false,
              }))
            : [],
          assignee: plan.leadCounselor,
          createdAt: new Date().toISOString().split("T")[0],
          tags: ["AI Generated", plan.category],
        }));

        setTasks((prev) => [...newTasks, ...prev]);

        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
        });

        logActivity(
          "plan-updated",
          plan.studentName,
          `AI generated ${newTasks.length} care tasks for ${plan.title}`
        );
      }
    } catch (err) {
      console.error("Failed to generate tasks:", err);
    } finally {
      setAiGeneratingPlanId(null);
    }
  };

  const logActivity = (type: CareActivity["type"], studentName: string, description: string) => {
    const newAct: CareActivity = {
      id: `act-${Date.now()}`,
      timestamp: "Just now",
      type,
      studentName,
      description,
      author: "Dr. Sarah Althaus",
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 19)]);
  };

  const handleResetDemoData = () => {
    if (window.confirm("Reset all care records, tasks, and plans to initial demo dataset?")) {
      setStudents(INITIAL_STUDENTS);
      setCarePlans(INITIAL_CARE_PLANS);
      setTasks(INITIAL_TASKS);
      setActivities(INITIAL_ACTIVITIES);
      localStorage.clear();
    }
  };

  const urgentTasksCount = tasks.filter(
    (t) => t.status !== "completed" && (t.priority === "urgent" || t.priority === "high")
  ).length;

  const pendingTasksCount = tasks.filter((t) => t.status !== "completed").length;
  const criticalStudents = students.filter(
    (s) => s.riskLevel === "critical" || s.riskLevel === "high"
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenNewTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenNewPlan={() => {
          setEditingPlan(null);
          setIsPlanModalOpen(true);
        }}
        onOpenAiChat={() => setActiveTab("assistant")}
        urgentTasksCount={urgentTasksCount}
        criticalStudents={criticalStudents}
        onSelectStudent={(student) => setSelectedStudentProfile(student)}
      />

      {/* Tabs Navigation */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        pendingTasksCount={pendingTasksCount}
        activePlansCount={carePlans.length}
        urgentCount={urgentTasksCount}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <DashboardView
            students={students}
            carePlans={carePlans}
            tasks={tasks}
            activities={activities}
            onToggleTaskStatus={handleToggleTaskStatus}
            onSelectTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onSelectPlan={(plan) => {
              setEditingPlan(plan);
              setIsPlanModalOpen(true);
            }}
            onSelectStudent={(student) => setSelectedStudentProfile(student)}
            onOpenNewTask={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onOpenNewPlan={() => {
              setEditingPlan(null);
              setIsPlanModalOpen(true);
            }}
            onOpenAiChat={() => setActiveTab("assistant")}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "tasks" && (
          <TaskManagementView
            tasks={tasks}
            onSelectTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onOpenNewTask={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onToggleTaskStatus={handleToggleTaskStatus}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onToggleChecklistItem={handleToggleChecklistItem}
            onOpenAiAssistant={() => setActiveTab("assistant")}
          />
        )}

        {activeTab === "projects" && (
          <ProjectsView
            carePlans={carePlans}
            tasks={tasks}
            students={students}
            onOpenNewPlan={() => {
              setEditingPlan(null);
              setIsPlanModalOpen(true);
            }}
            onSelectPlan={(plan) => {
              setEditingPlan(plan);
              setIsPlanModalOpen(true);
            }}
            onToggleMilestone={handleToggleMilestone}
            onSelectTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onGenerateTasksWithAi={handleGenerateTasksWithAi}
            aiGeneratingPlanId={aiGeneratingPlanId}
          />
        )}

        {activeTab === "priorities" && (
          <PrioritiesView
            tasks={tasks}
            onSelectTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onUpdateTaskPriority={handleUpdateTaskPriority}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsView
            students={students}
            carePlans={carePlans}
            tasks={tasks}
            onOpenAiAssistant={() => setActiveTab("assistant")}
          />
        )}

        {activeTab === "assistant" && (
          <AiAssistantChat
            students={students}
            carePlans={carePlans}
            tasks={tasks}
            onAddTask={(newTask) => {
              handleSaveTask(newTask);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-800">CarePilot</span>
            <span>•</span>
            <span>Intelligent Student Care Management System</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">
              Active Caseload: <strong className="text-slate-800">{students.length} Students</strong>
            </span>
            <button
              onClick={handleResetDemoData}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Reset records to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        initialTask={editingTask}
        students={students}
        carePlans={carePlans}
      />

      <CarePlanModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
          setEditingPlan(null);
        }}
        onSavePlan={handleSavePlan}
        initialPlan={editingPlan}
        students={students}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        tasks={tasks}
        carePlans={carePlans}
        students={students}
        onSelectTask={(task) => {
          setEditingTask(task);
          setIsTaskModalOpen(true);
        }}
        onSelectPlan={(plan) => {
          setEditingPlan(plan);
          setIsPlanModalOpen(true);
        }}
        onSelectStudent={(student) => {
          setSelectedStudentProfile(student);
        }}
      />

      <StudentProfileModal
        isOpen={!!selectedStudentProfile}
        onClose={() => setSelectedStudentProfile(null)}
        student={selectedStudentProfile}
        carePlans={carePlans}
        tasks={tasks}
        onToggleTaskStatus={handleToggleTaskStatus}
        onOpenNewTaskForStudent={(student) => {
          setEditingTask({
            id: "",
            title: `Check-in with ${student.name}`,
            description: "",
            category: "advising",
            priority: "medium",
            status: "todo",
            studentId: student.id,
            studentName: student.name,
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
            checklist: [],
            assignee: student.advisorName,
            createdAt: new Date().toISOString().split("T")[0],
            tags: ["Student Outreach"],
          });
          setIsTaskModalOpen(true);
        }}
        onOpenAiForStudent={(student) => {
          setActiveTab("assistant");
        }}
      />
    </div>
  );
}
