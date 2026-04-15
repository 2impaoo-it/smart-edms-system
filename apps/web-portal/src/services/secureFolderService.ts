import axiosClient from "../lib/axiosClient";

// ─── PIN-Protected Secure Folders ───────────────────────────────────────────

/**
 * Bật tính năng bảo mật PIN cho thư mục
 */
export const enableSecureFolder = (categoryId: number, pin: string) =>
  axiosClient.post(`/v1/secure-folders`, null, { params: { categoryId, pin } });

/**
 * Tắt bảo mật PIN cho thư mục
 */
export const disableSecureFolder = (categoryId: number, pin?: string) =>
  axiosClient.delete(`/v1/secure-folders/${categoryId}`);

/**
 * Xác thực PIN để mở thư mục bảo mật
 */
export const verifySecureFolderPin = (categoryId: number, pin: string) =>
  axiosClient.post(`/v1/secure-folders/${categoryId}/verify-pin`, { pin });

/**
 * Đổi PIN thư mục bảo mật
 */
export const changeSecureFolderPin = (categoryId: number, oldPin: string, newPin: string) =>
  axiosClient.put(`/v1/secure-folders/${categoryId}/change-pin`, null, { params: { oldPin, newPin } });

/**
 * Lấy danh sách thư mục bảo mật của user hiện tại
 */
export const getMySecureFolders = () =>
  axiosClient.get("/v1/secure-folders");

/**
 * Lấy lịch sử truy cập thư mục bảo mật
 */
export const getSecureAccessLogs = (categoryId: number) =>
  axiosClient.get(`/v1/secure-folders/${categoryId}/logs`);
