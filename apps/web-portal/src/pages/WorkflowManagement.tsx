import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, X, Settings2, Users } from "lucide-react";
import axiosClient from "../lib/axiosClient";
import { gooeyToast as toast } from "goey-toast";
import { getOrgChart } from "../services/userService";

interface ApprovalLevel {
  levelOrder: number;
  levelName: string;
  approverId: number;
  description: string;
}

interface Workflow {
  id?: number;
  name: string;
  description: string;
  approvalType: string;
  completionDaysLimit: number;
  approvalLevels: ApprovalLevel[];
  isActive?: boolean;
}

const WorkflowManagementPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [levels, setLevels] = useState<ApprovalLevel[]>([
    { levelOrder: 1, levelName: "Cấp 1", approverId: 0, description: "" }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wfRes, usersRes] = await Promise.all([
        axiosClient.get("/v1/approvals/workflows"),
        getOrgChart()
      ]);
      setWorkflows(wfRes.data || []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi", { description: "Không thể lấy dữ liệu cấu hình." });
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.fullName || user.username : `User ID: ${userId}`;
  };

  const handleAddLevel = () => {
    setLevels([
        ...levels, 
        { levelOrder: levels.length + 1, levelName: `Cấp ${levels.length + 1}`, approverId: 0, description: "" }
    ]);
  };

  const handleRemoveLevel = (index: number) => {
    if (levels.length <= 1) return;
    const newLevels = levels.filter((_, i) => i !== index).map((lvl, i) => ({
        ...lvl,
        levelOrder: i + 1,
        levelName: `Cấp ${i + 1}`
    }));
    setLevels(newLevels);
  };

  const handleSaveWorkflow = async () => {
    if (!name.trim()) return toast.error("Lỗi", { description: "Tên quy trình không được để trống" });
    if (levels.some(l => !l.approverId || l.approverId === 0)) return toast.error("Lỗi", { description: "Vui lòng chọn người duyệt cho tất cả các cấp" });

    try {
      await axiosClient.post("/v1/approvals/workflows", {
        name,
        description,
        approvalType: "SEQUENTIAL",
        completionDaysLimit: 7, // Mặc định 7 ngày
        approvalLevels: levels
      });
      toast.success("Thành công", { description: "Tạo quy trình mới thành công" });
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data || "Không thể lưu quy trình";
      toast.error("Lỗi 400", { description: String(msg) });
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setLevels([{ levelOrder: 1, levelName: "Cấp 1", approverId: 0, description: "" }]);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Settings2 className="text-primary w-6 h-6"/> Quản lý Quy trình duyệt</h2>
          <p className="text-sm text-slate-500 mt-1">Cấu hình các quy trình duyệt nhiều cấp cho tổ chức</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-[0_8px_16px_rgba(99,102,241,0.2)] hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" /> Tạo Quy Trình Mới
        </button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-slate-400">Đang tải cấu hình...</div>
      ) : workflows.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold">Chưa có quy trình nào</h3>
            <p className="text-sm text-slate-500 mt-2">Bấm tạo mới để thiết lập quy trình duyệt văn bản.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.map(wf => (
                <div key={wf.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-primary/30 transition-all group">
                    <h3 className="text-lg font-black text-slate-800">{wf.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{wf.description || "Không có mô tả"}</p>
                    
                    <div className="space-y-3">
                        <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Cấu trúc các bước duyệt:</div>
                        {wf.approvalLevels.map((lvl, idx) => (
                            <div key={lvl.levelOrder} className="flex flex-col relative">
                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-black flex items-center justify-center shrink-0">
                                        {lvl.levelOrder}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-700">{lvl.levelName}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3 h-3"/> {getUserName(lvl.approverId)}</p>
                                    </div>
                                </div>
                                {idx < wf.approvalLevels.length - 1 && (
                                    <div className="w-0.5 h-4 bg-slate-200 ml-7 my-0.5"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <h3 className="text-xl font-black">Tạo Quy Trình Mới</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Tên Quy Trình</label>
                        <input value={name} onChange={e=>setName(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary" placeholder="VD: Quy trình trình ký 3 bước..."/>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Mô tả chi tiết</label>
                        <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary" placeholder="Bắt đầu từ Trưởng phòng -> Kế toán trưởng -> Giám đốc"/>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-xs font-bold uppercase text-slate-500">Cấu hình các bước duyệt</label>
                            <button onClick={handleAddLevel} type="button" className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus className="w-4 h-4"/> Thêm Bước</button>
                        </div>
                        
                        <div className="space-y-4">
                            {levels.map((lvl, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 font-black flex items-center justify-center shrink-0 mt-1">{lvl.levelOrder}</div>
                                    <div className="flex-1 space-y-3">
                                        <input 
                                            value={lvl.levelName} 
                                            onChange={e => {
                                                const newLvls = [...levels];
                                                newLvls[idx].levelName = e.target.value;
                                                setLevels(newLvls);
                                            }}
                                            className="w-full text-sm font-bold border border-slate-200 rounded-lg p-2"
                                        />
                                        <select 
                                            value={lvl.approverId}
                                            onChange={e => {
                                                const newLvls = [...levels];
                                                newLvls[idx].approverId = Number(e.target.value);
                                                setLevels(newLvls);
                                            }}
                                            className="w-full text-sm border border-slate-200 rounded-lg p-2"
                                        >
                                            <option value={0}>-- Gán người duyệt --</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.fullName || u.username} ({u.jobTitle || 'N/A'})</option>
                                            ))}
                                        </select>
                                    </div>
                                    {levels.length > 1 && (
                                        <button onClick={() => handleRemoveLevel(idx)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg mt-1"><Trash2 className="w-5 h-5"/></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex gap-4 shrink-0 bg-white">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold bg-slate-100 text-slate-600 rounded-xl">Hủy</button>
                    <button onClick={handleSaveWorkflow} className="flex-1 py-3 text-sm font-black text-white bg-primary rounded-xl flex justify-center items-center gap-2"><Save className="w-4 h-4"/> Lưu Quy Trình</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManagementPage;
