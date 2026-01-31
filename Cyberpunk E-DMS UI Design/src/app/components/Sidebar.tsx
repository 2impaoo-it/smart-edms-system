import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  FileText, 
  PenTool, 
  Users, 
  Settings,
  Bell,
  Circle
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: PenTool, label: "Sign", path: "/sign/demo" },
  { icon: Users, label: "Team", path: "/team" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed left-0 top-0 h-screen w-20 glass border-r border-white/10 flex flex-col items-center py-6 z-50 hidden md:flex"
    >
      {/* Logo */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mb-12 relative"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center glow-primary">
          <span className="text-white font-bold text-xl">E</span>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 w-full px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-xl border border-[#6366f1]/30"
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  />
                )}

                <div
                  className={`relative w-full h-14 flex items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>

                {/* Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-2 bg-[#1f2937] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap text-sm border border-white/10 shadow-xl">
                  {item.label}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="mt-auto flex flex-col gap-3 items-center">
        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Bell className="w-5 h-5" strokeWidth={1.5} />
          <div className="absolute top-2 right-2 w-2 h-2 bg-[#ef4444] rounded-full animate-pulse" />
        </motion.button>

        {/* Profile */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative glass-hover rounded-xl p-0.5"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
            <span className="text-white font-semibold">JD</span>
          </div>
          {/* Online status */}
          <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-[#10b981] text-[#10b981]" />
        </motion.button>
      </div>
    </motion.aside>
  );
}