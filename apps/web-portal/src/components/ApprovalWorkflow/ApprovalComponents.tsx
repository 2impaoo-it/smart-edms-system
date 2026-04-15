import React from "react";
import { CheckCircle, XCircle, Clock, FileText, ChevronRight } from "lucide-react";

// Định nghĩa DocumentStatus type trực tiếp – tránh import từ file không tồn tại
export type DocumentStatusType =
  | "DRAFT"
  | "REVIEW"
  | "APPROVE"
  | "SIGNED"
  | "ARCHIVED"
  | "REJECTED"
  | "PENDING_APPROVAL"
  | "APPROVED";

/**
 * Component hiển thị badge trạng thái duyệt của document
 */
export const DocumentStatusBadge: React.FC<{ status: DocumentStatusType }> = ({ status }) => {
  const statusConfig: Record<DocumentStatusType, { color: string; bg: string; text: string }> = {
    DRAFT:            { color: "#64748b", bg: "#f1f5f9", text: "Nháp" },
    REVIEW:           { color: "#3b82f6", bg: "#eff6ff", text: "Đang duyệt" },
    APPROVE:          { color: "#f59e0b", bg: "#fffbeb", text: "Chờ phê duyệt" },
    SIGNED:           { color: "#10b981", bg: "#ecfdf5", text: "Đã ký" },
    ARCHIVED:         { color: "#06b6d4", bg: "#ecfeff", text: "Lưu trữ" },
    REJECTED:         { color: "#ef4444", bg: "#fef2f2", text: "Từ chối" },
    PENDING_APPROVAL: { color: "#f59e0b", bg: "#fffbeb", text: "Chờ duyệt" },
    APPROVED:         { color: "#10b981", bg: "#ecfdf5", text: "Đã phê duyệt" },
  };

  const cfg = statusConfig[status] ?? statusConfig.DRAFT;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}33`,
        letterSpacing: "0.03em",
      }}
    >
      {cfg.text}
    </span>
  );
};

/**
 * Component hiển thị lịch sử duyệt (Timeline) của document
 */
export const ApprovalHistoryTimeline: React.FC<{
  approvalHistory: any[];
  loading?: boolean;
}> = ({ approvalHistory = [], loading = false }) => {
  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "3px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        Đang tải lịch sử duyệt...
      </div>
    );
  }

  if (approvalHistory.length === 0) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
        <FileText style={{ width: 40, height: 40, margin: "0 auto 12px", opacity: 0.4 }} />
        <p style={{ margin: 0, fontWeight: 600 }}>Chưa có hành động duyệt nào</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    if (status === "APPROVED")  return <CheckCircle style={{ width: 18, height: 18, color: "#10b981" }} />;
    if (status === "REJECTED")  return <XCircle     style={{ width: 18, height: 18, color: "#ef4444" }} />;
    return                               <Clock       style={{ width: 18, height: 18, color: "#3b82f6" }} />;
  };

  const getDotColor = (status: string) => {
    if (status === "APPROVED") return "#10b981";
    if (status === "REJECTED") return "#ef4444";
    return "#3b82f6";
  };

  return (
    <div style={{ padding: "8px 0" }}>
      <h4 style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569", margin: "0 0 16px" }}>
        📋 Lịch Sử Duyệt
      </h4>
      <div style={{ position: "relative" }}>
        {approvalHistory.map((item, idx) => (
          <div key={idx} style={{ display: "flex", gap: "12px", marginBottom: idx < approvalHistory.length - 1 ? "20px" : 0 }}>
            {/* Dot + line */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: `${getDotColor(item.status)}15`,
                border: `2px solid ${getDotColor(item.status)}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {getStatusIcon(item.status)}
              </div>
              {idx < approvalHistory.length - 1 && (
                <div style={{ width: 2, flex: 1, background: "#e2e8f0", marginTop: 4, minHeight: 20 }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
                  Level {item.approvalLevel}: {item.approverName}
                </span>
                {item.approverJobTitle && (
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>({item.approverJobTitle})</span>
                )}
                <DocumentStatusBadge status={item.status} />
              </div>
              {item.comments && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                  💭 {item.comments}
                </p>
              )}
              {item.rejectionReason && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444", fontWeight: 600 }}>
                  ❌ Lý do từ chối: {item.rejectionReason}
                </p>
              )}
              {item.reviewedAt && (
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#94a3b8" }}>
                  {new Date(item.reviewedAt).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Component chọn workflow và gửi văn bản để duyệt
 */
export const SubmitForApprovalModal: React.FC<{
  visible: boolean;
  loading?: boolean;
  workflows: any[];
  onSubmit: (data: { approvalWorkflowId: number; submitNotes: string }) => void;
  onCancel: () => void;
}> = ({ visible, loading = false, workflows = [], onSubmit, onCancel }) => {
  const [selected, setSelected] = React.useState<number | null>(null);
  const [notes, setNotes] = React.useState("");

  const handleSubmit = () => {
    if (!selected) {
      alert("Vui lòng chọn quy trình duyệt");
      return;
    }
    onSubmit({ approvalWorkflowId: selected, submitNotes: notes });
    setSelected(null);
    setNotes("");
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998,
      background: "rgba(15,23,42,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{
        background: "white", borderRadius: "24px", padding: "32px",
        width: "100%", maxWidth: "480px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
      }}>
        <h3 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800 }}>📤 Gửi Văn Bản Để Duyệt</h3>
        <p style={{ margin: "0 0 24px", fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
          Chọn quy trình phê duyệt phù hợp
        </p>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "8px" }}>
            Quy Trình Duyệt *
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {workflows.length === 0 && (
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>Chưa có quy trình nào được cài đặt.</p>
            )}
            {workflows.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelected(w.id)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", borderRadius: "12px", cursor: "pointer",
                  border: selected === w.id ? "2px solid #6366f1" : "2px solid #e2e8f0",
                  background: selected === w.id ? "#eef2ff" : "white",
                  textAlign: "left", transition: "all 0.2s",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: selected === w.id ? "#4f46e5" : "#1e293b" }}>
                    {w.name}
                  </p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
                    {w.approvalLevels?.length || 0} cấp duyệt
                  </p>
                </div>
                {selected === w.id && <ChevronRight style={{ width: 16, height: 16, color: "#6366f1" }} />}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "8px" }}>
            Ghi Chú (tuỳ chọn)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nhập ghi chú khi gửi duyệt..."
            rows={3}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: "12px",
              border: "2px solid #e2e8f0", fontSize: "13px", resize: "none",
              outline: "none", boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "12px", borderRadius: "12px", border: "2px solid #e2e8f0",
              background: "white", cursor: "pointer", fontWeight: 700, fontSize: "13px", color: "#64748b",
            }}
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selected}
            style={{
              flex: 1, padding: "12px", borderRadius: "12px", border: "none",
              background: loading || !selected ? "#cbd5e1" : "#6366f1",
              color: "white", cursor: loading || !selected ? "not-allowed" : "pointer",
              fontWeight: 700, fontSize: "13px", transition: "all 0.2s",
            }}
          >
            {loading ? "Đang gửi..." : "Gửi Duyệt"}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Component cho Approver xử lý (approve/reject) document
 */
export const ApprovalActionPanel: React.FC<{
  documentId: number;
  currentLevel: number;
  approverName: string;
  onApprove: (data: { documentId: number; approved: true; comments: string }) => void;
  onReject:  (data: { documentId: number; approved: false; rejectionReason: string; comments: string }) => void;
  loading?: boolean;
}> = ({ documentId, currentLevel, approverName, onApprove, onReject, loading = false }) => {
  const [action, setAction] = React.useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = React.useState("");
  const [comments, setComments] = React.useState("");

  const handleAction = () => {
    if (action === "reject" && !reason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }
    if (action === "approve") {
      onApprove({ documentId, approved: true, comments });
    } else if (action === "reject") {
      onReject({ documentId, approved: false, rejectionReason: reason, comments });
    }
    setAction(null);
    setReason("");
    setComments("");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: "2px solid #e2e8f0", fontSize: "13px", resize: "none" as const,
    outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit",
    display: "block",
  };

  return (
    <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0" }}>
      <h4 style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569" }}>
        ⚖️ Xử Lý — Level {currentLevel} ({approverName})
      </h4>

      {action === null ? (
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => setAction("approve")}
            style={{
              flex: 1, padding: "12px", borderRadius: "12px", border: "none",
              background: "#10b981", color: "white", fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            <CheckCircle style={{ width: 16, height: 16 }} />
            Phê Duyệt
          </button>
          <button
            onClick={() => setAction("reject")}
            style={{
              flex: 1, padding: "12px", borderRadius: "12px", border: "none",
              background: "#ef4444", color: "white", fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            <XCircle style={{ width: 16, height: 16 }} />
            Từ Chối
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "6px" }}>
              Bình Luận (tuỳ chọn)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Nhập bình luận..."
              rows={2}
              style={inputStyle}
            />
          </div>

          {action === "reject" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444", display: "block", marginBottom: "6px" }}>
                Lý Do Từ Chối *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={2}
                style={{ ...inputStyle, borderColor: "#ef4444" }}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setAction(null)}
              style={{
                padding: "10px 20px", borderRadius: "10px", border: "2px solid #e2e8f0",
                background: "white", cursor: "pointer", fontWeight: 700, fontSize: "13px", color: "#64748b",
              }}
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleAction}
              disabled={loading}
              style={{
                flex: 1, padding: "10px", borderRadius: "10px", border: "none",
                background: action === "approve" ? "#10b981" : "#ef4444",
                color: "white", cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 700, fontSize: "13px", opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Đang xử lý..."
                : action === "approve"
                  ? "✅ Xác Nhận Phê Duyệt"
                  : "❌ Xác Nhận Từ Chối"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
