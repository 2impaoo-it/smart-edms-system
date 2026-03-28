import axiosClient from "../lib/axiosClient";

/**
 * Các API phục vụ Quản trị hệ thống (Admin Dashboard, System Health, Admin Storage)
 */

export const getSystemHealth = () => axiosClient.get("/admin/health");

export const getDashboardOverview = () => axiosClient.get("/admin/dashboard/overview");

export const getDashboardStorage = () => axiosClient.get("/admin/dashboard/storage");

export const getGlobalTrash = () => axiosClient.get("/admin/storage/trash");

export const emptyGlobalTrash = () => axiosClient.delete("/admin/storage/trash/empty");
