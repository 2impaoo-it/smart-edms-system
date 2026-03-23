import axiosClient from "../lib/axiosClient";

export interface FolderCreatePayload {
  name: string;
  parentId: string | null;
  folderType?: string;
}

/**
 * Lấy danh sách nội dung trong một thư mục.
 * @param parentId - null để lấy thư mục gốc
 * @param folderType - 'PERSONAL' hoặc 'DEPARTMENT' để lọc theo loại
 */
export const getFolderContents = (parentId: string | null, folderType?: string) =>
  axiosClient.get("/categories", { params: { parentId, folderType } });

/**
 * Lấy cây thư mục cá nhân
 */
export const getPersonalTree = () =>
  axiosClient.get("/categories/tree/personal");

/**
 * Lấy cây thư mục phòng ban
 */
export const getDepartmentTree = () =>
  axiosClient.get("/categories/tree/department");

/**
 * Lấy toàn bộ cây thư mục (cả cá nhân + phòng ban)
 */
export const getFolderTree = () =>
  axiosClient.get("/categories/tree");

/**
 * Tạo thư mục mới.
 */
export const createFolder = (payload: FolderCreatePayload) =>
  axiosClient.post("/categories", payload);

/**
 * Đổi tên thư mục.
 */
export const renameFolder = (id: string, name: string) =>
  axiosClient.put(`/categories/${id}`, { name });

/**
 * Xóa thư mục (chuyển vào thùng rác).
 */
export const deleteFolder = (id: string) =>
  axiosClient.delete(`/categories/${id}`);
