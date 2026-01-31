import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { LayoutDashboard, FileText, PenTool, Users } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Docs", path: "/documents" },
  { icon: PenTool, label: "Sign", path: "/sign/demo" },
  { icon: Users, label: "Team", path: "/team" },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 z-50 md:hidden"
    >
      <div className="grid grid-cols-4 gap-1 p-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="relative flex flex-col items-center gap-1 p-3 rounded-xl transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMobileNav"
                    className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-xl border border-[#6366f1]/30"
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 ${
                    isActive ? "text-[#6366f1]" : "text-gray-400"
                  }`}
                  strokeWidth={1.5}
                />
                <span
                  className={`text-xs relative z-10 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
