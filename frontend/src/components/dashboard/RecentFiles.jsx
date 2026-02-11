import { Clock, Files } from "lucide-react";

const RecentFiles = ({ files }) => {
    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" />
                Recent Files
            </h3>
            <div className="space-y-4">
                {files.map(file => (
                    <div key={file.id} className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                            <Files className="w-8 h-8 text-primary/80 p-1.5 bg-primary/10 rounded" />
                            <div>
                                <p className="text-sm font-medium text-gray-200">{file.name}</p>
                                <p className="text-xs text-gray-500">{file.size}</p>
                            </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${file.status === 'Signed' ? 'bg-success/20 text-success' :
                            file.status === 'Pending' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                            }`}>
                            {file.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentFiles;
