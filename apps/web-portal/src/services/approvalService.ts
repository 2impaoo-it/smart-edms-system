import axiosClient from "../lib/axiosClient";

// ─── Approval Workflow ───────────────────────────────────────────────────────

/** Lấy danh sách tất cả workflow */
export const getAllWorkflows = () =>
  axiosClient.get("/v1/approvals/workflows");

/** Tạo workflow mới */
export const createWorkflow = (data: {
  name: string;
  description?: string;
  approvalType: "SEQUENTIAL" | "PARALLEL";
  completionDaysLimit: number;
  approvalLevels: {
    levelOrder: number;
    levelName: string;
    approverId: number;
    description?: string;
  }[];
}) => axiosClient.post("/v1/approvals/workflows", data);

/** Lấy document đang chờ duyệt cho user hiện tại */
export const getPendingApprovalsForMe = () =>
  axiosClient.get("/v1/approvals/pending");

/** Gửi document để bắt đầu quy trình duyệt */
export const submitForApproval = (data: {
  documentId: number;
  approvalWorkflowId: number;
  submitNotes?: string;
  levelOverrides?: { levelOrder: number; requireSignature: boolean }[];
}) => axiosClient.post("/v1/approvals/submit", data);

/** Xử lý phê duyệt / từ chối */
export const processApprovalAction = (data: {
  documentId: number;
  approved: boolean;
  comments?: string;
  rejectionReason?: string;
}) => axiosClient.post("/v1/approvals/process", data);

/** Lấy lịch sử duyệt của một document */
export const getApprovalHistory = (documentId: number) =>
  axiosClient.get(`/v1/approvals/documents/${documentId}/history`);

/** Lấy toàn bộ lịch sử duyệt (Admin) */
export const getAllApprovalHistory = (page = 0, size = 20) =>
  axiosClient.get("/v1/approvals/history", { params: { page, size } });
