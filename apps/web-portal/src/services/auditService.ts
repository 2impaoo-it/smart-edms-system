import axiosClient from "../lib/axiosClient";

// Lấy danh sách nhật ký hệ thống (Audit Logs)
export const getAuditLogs = (params?: { limit?: number, action?: string }) => {
  return axiosClient.get<any[]>("/audit/logs", { params });
};
