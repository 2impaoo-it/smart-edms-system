import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import axiosClient from "../lib/axiosClient";
import { ApprovalHistoryTimeline } from "../components/ApprovalWorkflow/ApprovalComponents";

interface PendingApprovalItem {
  documentId: number;
  documentTitle?: string;
  approvalLevel: number;
  approverName?: string;
  submittedAt?: string;
  daysDeadline?: number;
}

/**
 * Page Quản Lý Duyệt Văn Bản
 * - Danh sách document chờ duyệt (pending)
 * - Lịch sử duyệt của từng document
 */
const ApprovalManagementPage: React.FC = () => {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApprovalItem[]>([]);
  const [processedHistory, setProcessedHistory] = useState<any[]>([]);
  const [historyMap, setHistoryMap] = useState<Record<number, any[]>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  // Lấy danh sách chờ duyệt qua axiosClient (có JWT interceptor)
  const fetchPendingApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/v1/approvals/pending");
      setPendingApprovals(res.data ?? []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách chờ duyệt:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProcessedHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await axiosClient.get("/v1/approvals/history");
      setProcessedHistory(res.data ?? []);
    } catch (err) {
      console.error("Lỗi khi lấy lịch sử duyệt cá nhân:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingApprovals();
    } else {
      fetchProcessedHistory();
    }
  }, [activeTab, fetchPendingApprovals, fetchProcessedHistory]);

  // Lấy lịch sử duyệt của 1 document
  const fetchHistory = async (documentId: number) => {
    if (historyMap[documentId]) return; // Đã cache
    try {
      const res = await axiosClient.get(`/v1/approvals/documents/${documentId}/history`);
      setHistoryMap((prev) => ({ ...prev, [documentId]: res.data ?? [] }));
    } catch (err) {
      console.error("Lỗi khi lấy lịch sử duyệt:", err);
    }
  };

  const toggleExpand = (docId: number) => {
    if (expandedId === docId) {
      setExpandedId(null);
    } else {
      setExpandedId(docId);
      fetchHistory(docId);
    }
  };

  const handleApprove = async (documentId: number) => {
    if (!window.confirm("Xác nhận phê duyệt văn bản này?")) return;
    setActionLoading(documentId);
    try {
      await axiosClient.post("/v1/approvals/process", {
        documentId,
        approved: true,
        comments: "",
      });
      alert("✅ Văn bản đã được phê duyệt!");
      fetchPendingApprovals();
      // Xoá cache lịch sử cũ để reload lại
      setHistoryMap((prev) => { const n = { ...prev }; delete n[documentId]; return n; });
    } catch (err) {
      console.error("Lỗi khi phê duyệt:", err);
      alert("❌ Lỗi khi phê duyệt. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (documentId: number) => {
    const reason = window.prompt("Nhập lý do từ chối:");
    if (!reason?.trim()) {
      alert("Bắt buộc phải nhập lý do từ chối.");
      return;
    }
    setActionLoading(documentId);
    try {
      await axiosClient.post("/v1/approvals/process", {
        documentId,
        approved: false,
        rejectionReason: reason.trim(),
        comments: "",
      });
      alert("❌ Đã từ chối văn bản.");
      fetchPendingApprovals();
      setHistoryMap((prev) => { const n = { ...prev }; delete n[documentId]; return n; });
    } catch (err) {
      console.error("Lỗi khi từ chối:", err);
      alert("❌ Lỗi khi từ chối. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Styles ───────────────────────────────────────────────────
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 20px", borderRadius: "10px", border: "none",
    cursor: "pointer", fontWeight: 700, fontSize: "13px",
    background: active ? "#6366f1" : "transparent",
    color:      active ? "white" : "#64748b",
    transition: "all 0.2s",
  });

  const cardStyle: React.CSSProperties = {
    background: "white", borderRadius: "16px", padding: "20px",
    border: "1px solid #e2e8f0", marginBottom: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 900, color: "#1e293b" }}>⚖️ Quản Lý Duyệt Văn Bản</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>
            Xem và xử lý các văn bản đang chờ phê duyệt
          </p>
        </div>
        <button
          onClick={fetchPendingApprovals}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "10px 18px", borderRadius: "12px", border: "2px solid #e2e8f0",
            background: "white", cursor: "pointer", fontWeight: 700, fontSize: "13px", color: "#475569",
          }}
        >
          <RefreshCw style={{ width: 15, height: 15, animation: loading ? "spin 0.8s linear infinite" : "none" }} />
          Làm Mới
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", background: "#f1f5f9", borderRadius: "14px", padding: "6px" }}>
        <button style={tabStyle(activeTab === "pending")} onClick={() => setActiveTab("pending")}>
          ⏳ Chờ Duyệt
          {pendingApprovals.length > 0 && (
            <span style={{ marginLeft: "8px", background: "#ef4444", color: "white", borderRadius: "999px", padding: "1px 7px", fontSize: "11px" }}>
              {pendingApprovals.length}
            </span>
          )}
        </button>
        <button style={tabStyle(activeTab === "history")} onClick={() => setActiveTab("history")}>
          📋 Lịch Sử Duyệt
        </button>
      </div>

      {/* ─── Tab: Pending ─── */}
      {activeTab === "pending" && (
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
              <div style={{ width: 36, height: 36, border: "3px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              Đang tải danh sách chờ duyệt...
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
              <CheckCircle style={{ width: 48, height: 48, margin: "0 auto 12px", opacity: 0.3 }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: "15px" }}>Không có văn bản chờ duyệt</p>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>Tất cả văn bản đã được xử lý ✅</p>
            </div>
          ) : (
            pendingApprovals.map((item) => (
              <div key={item.documentId} style={cardStyle}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                  {/* Info */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "12px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Clock style={{ width: 20, height: 20, color: "#d97706" }} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>
                        Văn bản #{item.documentId}
                        {item.documentTitle && ` — ${item.documentTitle}`}
                      </h4>
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                        Cấp duyệt: <strong>Level {item.approvalLevel}</strong>
                        {item.approverName && <> • Người duyệt: <strong>{item.approverName}</strong></>}
                      </p>
                      {item.submittedAt && (
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>
                          Gửi lúc: {new Date(item.submittedAt).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end", flexShrink: 0 }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleApprove(item.documentId)}
                        disabled={actionLoading === item.documentId}
                        style={{
                          padding: "8px 16px", borderRadius: "10px", border: "none",
                          background: "#10b981", color: "white", cursor: "pointer",
                          fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px",
                          opacity: actionLoading === item.documentId ? 0.6 : 1,
                        }}
                      >
                        <CheckCircle style={{ width: 14, height: 14 }} />
                        Phê Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(item.documentId)}
                        disabled={actionLoading === item.documentId}
                        style={{
                          padding: "8px 16px", borderRadius: "10px", border: "none",
                          background: "#ef4444", color: "white", cursor: "pointer",
                          fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px",
                          opacity: actionLoading === item.documentId ? 0.6 : 1,
                        }}
                      >
                        <XCircle style={{ width: 14, height: 14 }} />
                        Từ Chối
                      </button>
                    </div>
                    {/* Toggle lịch sử inline */}
                    <button
                      onClick={() => toggleExpand(item.documentId)}
                      style={{
                        padding: "4px 10px", borderRadius: "8px", border: "1px solid #e2e8f0",
                        background: "white", cursor: "pointer", fontSize: "11px", color: "#64748b",
                        display: "flex", alignItems: "center", gap: "4px",
                      }}
                    >
                      {expandedId === item.documentId ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
                      Lịch sử
                    </button>
                  </div>
                </div>

                {/* Inline history */}
                {expandedId === item.documentId && (
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                    <ApprovalHistoryTimeline
                      approvalHistory={historyMap[item.documentId] ?? []}
                      loading={!historyMap[item.documentId]}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Tab: History ─── */}
      {activeTab === "history" && (
        <div>
          {historyLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
               <RefreshCw style={{ width: 24, height: 24, animation: "spin 1s linear infinite", margin: "0 auto 8px" }} />
               Đang tải lịch sử...
            </div>
          ) : processedHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
              <Clock style={{ width: 48, height: 48, margin: "0 auto 12px", opacity: 0.3 }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: "15px" }}>Chưa có lịch sử phê duyệt</p>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>Các văn bản bạn đã xử lý sẽ hiện ở đây.</p>
            </div>
          ) : (
            processedHistory.map((item) => (
              <div key={item.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                   <div style={{ display: "flex", gap: "12px" }}>
                      <div style={{ 
                        width: 40, height: 40, borderRadius: "12px", 
                        background: item.status === "APPROVED" ? "#dcfce7" : "#fee2e2", 
                        display: "flex", alignItems: "center", justifyContent: "center" 
                      }}>
                        {item.status === "APPROVED" ? <CheckCircle style={{ color: "#16a34a", width: 20, height: 20 }} /> : <XCircle style={{ color: "#dc2626", width: 20, height: 20 }} />}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>Văn bản #{item.documentId}</h4>
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                          Trạng thái: <span style={{ color: item.status === "APPROVED" ? "#16a34a" : "#dc2626", fontWeight: 800 }}>{item.status === "APPROVED" ? "ĐÃ DUYỆT" : "TỪ CHỐI"}</span>
                        </p>
                        {item.reviewedAt && (
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>
                            Thời gian: {new Date(item.reviewedAt).toLocaleString("vi-VN")}
                          </p>
                        )}
                      </div>
                   </div>
                   <button
                      onClick={() => toggleExpand(item.documentId)}
                      style={{
                        padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0",
                        background: "white", cursor: "pointer", fontSize: "11px", color: "#64748b",
                        display: "flex", alignItems: "center", gap: "4px",
                      }}
                    >
                      {expandedId === item.documentId ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
                      Chi tiết flow
                    </button>
                </div>
                
                {expandedId === item.documentId && (
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                    <ApprovalHistoryTimeline
                      approvalHistory={historyMap[item.documentId] ?? []}
                      loading={!historyMap[item.documentId]}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* CSS animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ApprovalManagementPage;
