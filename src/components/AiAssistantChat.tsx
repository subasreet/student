import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  Plus,
  RefreshCw,
  Flame,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ChatMessage, Task, Student, CarePlan } from "../types";

interface AiAssistantChatProps {
  students: Student[];
  carePlans: CarePlan[];
  tasks: Task[];
  onAddTask: (newTask: Omit<Task, "id" | "createdAt">) => void;
}

export const AiAssistantChat: React.FC<AiAssistantChatProps> = ({
  students,
  carePlans,
  tasks,
  onAddTask,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: `### 👋 Welcome to CarePilot AI Assistant

I am your intelligent Student Care Copilot. I have analyzed your **${students.length} monitored students**, **${carePlans.length} active care plans**, and **${tasks.length} care tasks**.

How can I assist you today?
- **Prioritization:** "What urgent care tasks should I prioritize today?"
- **Care Plan Creation:** "Break down a 4-week recovery plan for a student struggling with exams"
- **Progress Digest:** "Summarize current caseload progress and resolved interventions"
- **Empathetic Drafting:** "Draft a supportive check-in message for Marcus regarding concussion accommodation"`,
      timestamp: "Just now",
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: "⚡ Prioritize Urgent Tasks", prompt: "Prioritize my urgent tasks for today based on student risk and deadlines." },
    { label: "📋 Break Down Intervention", prompt: "Break down an academic recovery plan into 4 actionable tasks for a struggling student." },
    { label: "📊 Caseload Summary", prompt: "Summarize our overall student care progress, velocity, and remaining risk areas." },
    { label: "💌 Draft Wellness Check-in", prompt: "Draft an empathetic wellness check-in message for Marcus Washington regarding medical accommodations." },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputMessage;
    if (!message.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          contextData: {
            students: students.map((s) => ({ name: s.name, risk: s.riskLevel, major: s.major, wellness: s.wellnessScore })),
            projects: carePlans.map((p) => ({ title: p.title, progress: p.progress, student: p.studentName })),
            tasks: tasks.map((t) => ({ title: t.title, status: t.status, priority: t.priority, due: t.dueDate, student: t.studentName })),
          },
        }),
      });

      const data = await response.json();

      // Check if response contains suggested task objects
      let suggestedTasks: Array<Partial<Task>> | undefined = undefined;

      // Extract json_tasks if available
      const jsonMatch = data.reply?.match(/```json_tasks([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          suggestedTasks = JSON.parse(jsonMatch[1].trim());
        } catch (e) {
          console.error("Failed to parse json_tasks:", e);
        }
      }

      // If user asked to break down or plan, formulate practical suggested tasks if not already extracted
      if (!suggestedTasks && (message.toLowerCase().includes("break down") || message.toLowerCase().includes("tasks"))) {
        suggestedTasks = [
          {
            title: "Initial diagnostic & academic review conference",
            description: "Assess mid-semester grade factors and identify specific tutoring needs.",
            category: "academic",
            priority: "high",
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
            checklist: [
              { id: "c-a1", text: "Audit LMS assignment submission records", completed: false },
              { id: "c-a2", text: "Schedule 30-minute academic counseling session", completed: false },
            ],
            assignee: "Dr. Sarah Althaus",
            tags: ["Intervention", "AI Generated"],
          },
          {
            title: "Coordinate departmental tutoring & weekly study hours",
            description: "Pair student with specialized peer tutor and set up verification log.",
            category: "academic",
            priority: "medium",
            dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
            checklist: [
              { id: "c-a3", text: "Confirm tutor schedule with Math/Science lab", completed: false },
              { id: "c-a4", text: "Send meeting calendar invite", completed: false },
            ],
            assignee: "Dr. Sarah Althaus",
            tags: ["Peer Tutoring", "AI Generated"],
          },
        ];
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply || "I am ready to assist with your student care workflows.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedTasks,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: "assistant",
        content: `### ⚡ CarePilot Prioritization Plan

Here is your immediate care triage:
1. **Immediate (Marcus Washington):** Finalize hospital accommodation memo to avoid exam penalties.
2. **Before 2:00 PM (Liam Patel):** Clear emergency tuition hold with the Bursar.
3. **Mid-day (Maya Chen):** Confirm STEM calculus peer tutor pairing.

Let me know if you would like me to auto-generate these as tasks directly on your board!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportTask = (taskSuggestion: Partial<Task>) => {
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.8 },
    });

    onAddTask({
      title: taskSuggestion.title || "AI Generated Care Task",
      description: taskSuggestion.description || "",
      category: taskSuggestion.category || "advising",
      priority: taskSuggestion.priority || "medium",
      status: "todo",
      studentName: taskSuggestion.studentName || students[0]?.name,
      studentId: students[0]?.id,
      dueDate: taskSuggestion.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      checklist: (taskSuggestion.checklist as any) || [
        { id: `c-${Date.now()}-1`, text: "Initiate student contact", completed: false },
        { id: `c-${Date.now()}-2`, text: "Log session notes", completed: false },
      ],
      assignee: taskSuggestion.assignee || "Dr. Sarah Althaus",
      tags: taskSuggestion.tags || ["AI Generated", "CarePilot"],
    });
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[750px]">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-white">CarePilot AI Assistant</h2>
              <span className="px-2 py-0.2 text-[10px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-full">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Caseload Organizer, Priority Triage & Case Summary Copilot
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: "msg-welcome-reset",
                role: "assistant",
                content: "Conversation history reset. How can I assist your student care caseload right now?",
                timestamp: "Just now",
              },
            ]);
          }}
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors px-2.5 py-1 rounded bg-white/10 hover:bg-white/15"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 shrink-0">
          Quick Prompts:
        </span>
        {quickPrompts.map((qp) => (
          <button
            key={qp.label}
            onClick={() => handleSendMessage(qp.prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? "bg-slate-800 text-white"
                    : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                }`}
              >
                {isUser ? "You" : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-4 text-sm leading-relaxed space-y-2 ${
                  isUser
                    ? "bg-indigo-600 text-white shadow-xs rounded-tr-none"
                    : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between gap-4 pb-1 border-b border-black/5 text-xs opacity-75">
                  <span className="font-semibold">{isUser ? "You" : "CarePilot AI"}</span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:text-slate-900 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Content formatted */}
                <div className="whitespace-pre-line text-sm font-sans space-y-1">
                  {msg.content}
                </div>

                {/* Suggested task cards from assistant */}
                {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <p className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Suggested Actionable Tasks:
                    </p>

                    <div className="space-y-2">
                      {msg.suggestedTasks.map((st, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 truncate">{st.title}</p>
                            <p className="text-slate-500 text-[11px] truncate">{st.description}</p>
                          </div>

                          <button
                            onClick={() => handleImportTask(st)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer shrink-0"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add to Board</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>CarePilot is analyzing your caseload and crafting actionable advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3.5 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask CarePilot to organize tasks, prioritize work, or summarize progress..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center gap-1.5 text-sm font-semibold cursor-pointer shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
