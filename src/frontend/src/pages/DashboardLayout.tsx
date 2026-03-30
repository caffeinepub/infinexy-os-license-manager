import { Button } from "@/components/ui/button";
import {
  Bell,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useLocalAuth } from "../hooks/useLocalAuth";
import { LicensesView } from "./LicensesView";
import { SettingsView } from "./SettingsView";

type NavPage = "dashboard" | "licenses" | "settings";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  ocid: string;
}

function NavItem({ icon: Icon, label, active, onClick, ocid }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "text-white"
          : "text-sidebar-muted hover:text-sidebar-foreground"
      }`}
      style={
        active
          ? {
              background: "oklch(0.22 0.025 220)",
              borderLeft: "3px solid oklch(0.56 0.18 253)",
            }
          : {}
      }
    >
      <Icon
        className={`w-4 h-4 flex-shrink-0 ${active ? "text-sidebar-primary" : ""}`}
      />
      {label}
    </button>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onLogout}
      data-ocid="nav.logout.button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
      style={{
        color: hovered ? "oklch(0.65 0.22 29)" : "oklch(0.55 0.01 220)",
      }}
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}

export function DashboardLayout() {
  const [activePage, setActivePage] = useState<NavPage>("licenses");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clear, username } = useLocalAuth();
  const { theme, toggleTheme } = useTheme();

  const displayName = username || "User";

  const navItems: { id: NavPage; icon: React.ElementType; label: string }[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "licenses", icon: Key, label: "Licenses" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const Sidebar = () => (
    <div
      className="h-full flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.28 0.025 220) 0%, oklch(0.20 0.022 220) 100%)",
      }}
    >
      {/* Brand */}
      <div
        className="px-4 py-5 border-b"
        style={{ borderColor: "oklch(0.35 0.02 220)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.56 0.18 253)" }}
          >
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground leading-tight">
              Infinexy Solution
            </p>
            <p className="text-xs" style={{ color: "oklch(0.55 0.01 220)" }}>
              OS License Manager
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activePage === item.id}
            onClick={() => {
              setActivePage(item.id);
              setSidebarOpen(false);
            }}
            ocid={`nav.${item.id}.link`}
          />
        ))}
      </nav>

      {/* Logout */}
      <div
        className="px-3 py-4 border-t"
        style={{ borderColor: "oklch(0.35 0.02 220)" }}
      >
        <LogoutButton onLogout={() => clear()} />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-60 lg:hidden"
            >
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setSidebarOpen(true)}
              data-ocid="nav.menu.button"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div>
              <p className="text-sm font-semibold text-foreground hidden sm:block">
                Welcome back,{" "}
                <span style={{ color: "oklch(0.56 0.18 253)" }}>
                  {displayName}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              data-ocid="nav.theme.toggle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              {theme === "light" ? (
                <>
                  <Moon className="w-3.5 h-3.5" /> Dark
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5" /> Light
                </>
              )}
            </button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
            >
              <Bell className="w-4 h-4" />
            </Button>

            {/* User Chip */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border"
              data-ocid="nav.user.panel"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "oklch(0.56 0.18 253)" }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-foreground hidden sm:block max-w-24 truncate">
                {displayName}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            {activePage === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <LicensesView />
              </motion.div>
            )}
            {activePage === "licenses" && (
              <motion.div
                key="licenses"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <LicensesView />
              </motion.div>
            )}
            {activePage === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
