import React from "react";
import { LayoutDashboard, CheckSquare, Layers, Flame, BarChart3, Bot, Sparkles } from "lucide-react";

export type NavTab = "dashboard" | "tasks" | "projects" | "priorities" | "analytics" | "assistant";

interface NavigationProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  pendingTasksCount: number;
  activePlansCount: number;
  urgentCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  pendingTasksCount,
  activePlansCount,
  urgentCount,
}) => {
  const tabs = [
    {
      id: "dashboard" as NavTab,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "tasks" as NavTab,
      label: "Task Management",
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      badgeColor: "bg-slate-200 text-slate-700",
    },
    {
      id: "projects" as NavTab,
      label: "Care Plans & Projects",
      icon: Layers,
      badge: activePlansCount > 0 ? activePlansCount : null,
      badgeColor: "bg-indigo-100 text-indigo-700",
    },
    {
      id: "priorities" as NavTab,
      label: "Priorities Matrix",
      icon: Flame,
      badge: urgentCount > 0 ? `${urgentCount} Urgent` : null,
      badgeColor: "bg-rose-100 text-rose-700 font-semibold",
    },
    {
      id: "analytics" as NavTab,
      label: "Progress Analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "assistant" as NavTab,
      label: "AI Assistant",
      icon: Bot,
      isAi: true,
      badge: "Gemini 3.8",
      badgeColor: "bg-indigo-100 text-indigo-700",
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? tab.isAi
                        ? "text-indigo-300"
                        : "text-white"
                      : tab.isAi
                      ? "text-indigo-600"
                      : "text-slate-400"
                  }`}
                />
                <span>{tab.label}</span>

                {tab.badge && (
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-white/20 text-white" : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
