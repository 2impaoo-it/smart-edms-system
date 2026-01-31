import { motion } from "framer-motion";
import { FileText, PenTool, Users, TrendingUp } from "lucide-react";
import { StatCard } from "../components/dashboard/StatCard";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { StorageRing } from "../components/dashboard/StorageRing";
import { QuickActions } from "../components/dashboard/QuickActions";
import { DocTable } from "../components/dashboard/DocTable";
import { FloatingActionMenu } from "../components/dashboard/FloatingActionMenu";

// Mock sparkline data
const sparklineData = [
    { value: 30 },
    { value: 45 },
    { value: 35 },
    { value: 55 },
    { value: 48 },
    { value: 62 },
    { value: 58 },
    { value: 72 },
    { value: 68 },
    { value: 85 },
];

const Dashboard = () => {
    return (
        <div className="min-h-screen p-4 md:p-8 bg-[#030712] text-white">
            <FloatingActionMenu />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 md:mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    <span className="gradient-text">Smart E-DMS</span>
                </h1>
                <p className="text-sm md:text-base text-gray-400">
                    Enterprise Document Management • The Ferrari of DMS
                </p>
            </motion.div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-12 gap-6">
                {/* Hero Stat - Large */}
                <div className="col-span-12 lg:col-span-5">
                    <StatCard
                        title="Documents Signed Today"
                        value={247}
                        change="+23.4%"
                        trend="up"
                        icon={PenTool}
                        sparklineData={sparklineData}
                        className="h-full"
                    />
                </div>

                {/* Activity Feed - Medium */}
                <div className="col-span-12 lg:col-span-4">
                    <ActivityFeed />
                </div>

                {/* Storage Ring - Small */}
                <div className="col-span-12 lg:col-span-3">
                    <StorageRing />
                </div>

                {/* Quick Stats Row */}
                <div className="col-span-12 md:col-span-4">
                    <StatCard
                        title="Total Documents"
                        value="12,458"
                        change="+12.3%"
                        trend="up"
                        icon={FileText}
                    />
                </div>

                <div className="col-span-12 md:col-span-4">
                    <StatCard
                        title="Active Users"
                        value={3247}
                        change="+8.7%"
                        trend="up"
                        icon={Users}
                    />
                </div>

                <div className="col-span-12 md:col-span-4">
                    <StatCard
                        title="Completion Rate"
                        value="94.2%"
                        change="+2.1%"
                        trend="up"
                        icon={TrendingUp}
                    />
                </div>

                {/* Quick Actions - Full Width */}
                <div className="col-span-12">
                    <QuickActions />
                </div>

                {/* Document Table - Full Width */}
                <div className="col-span-12">
                    <DocTable />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
