export type PriorityLevel = "urgent" | "high" | "medium" | "low";

export type TaskStatus = "todo" | "in_progress" | "waiting" | "completed";

export type CareCategory =
  | "academic"
  | "wellness"
  | "financial"
  | "accommodation"
  | "advising";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: CareCategory;
  priority: PriorityLevel;
  status: TaskStatus;
  studentId?: string;
  studentName?: string;
  planId?: string;
  planTitle?: string;
  dueDate: string;
  estimatedMinutes?: number;
  checklist: ChecklistItem[];
  assignee: string;
  createdAt: string;
  tags: string[];
}

export interface CarePlanMilestone {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string;
}

export interface CarePlan {
  id: string;
  title: string;
  description: string;
  category: CareCategory;
  studentId: string;
  studentName: string;
  leadCounselor: string;
  status: "planning" | "in-progress" | "review" | "completed";
  startDate: string;
  targetDate: string;
  progress: number;
  milestones: CarePlanMilestone[];
  tags: string[];
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  email: string;
  studentNumber: string;
  major: string;
  year: "Freshman" | "Sophomore" | "Junior" | "Senior" | "Graduate";
  gpa: number;
  wellnessScore: number; // 0 to 100
  riskLevel: "low" | "moderate" | "high" | "critical";
  tags: string[];
  advisorName: string;
  activePlanId?: string;
  emergencyContact?: string;
}

export interface CareActivity {
  id: string;
  timestamp: string;
  type: "check-in" | "academic-review" | "wellness-alert" | "task-completed" | "plan-updated";
  studentName: string;
  description: string;
  author: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedTasks?: Array<Partial<Task>>;
}
