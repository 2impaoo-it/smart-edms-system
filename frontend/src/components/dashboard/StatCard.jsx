import { ArrowUp, ArrowDown } from "lucide-react";

const StatCard = ({ title, value, change, icon: Icon }) => (
    <div className="glass-card p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <Icon className="w-12 h-12 text-white/5" />
        </div>
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Icon className="w-6 h-6" />
            </div>
            <span className={`text-sm flex items-center ${change > 0 ? "text-success" : "text-error"}`}>
                {change > 0 ? '+' : ''}{change}%
            </span>
        </div>
        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{value}</h3>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
    </div>
);

export default StatCard;
