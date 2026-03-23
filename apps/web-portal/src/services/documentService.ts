import axiosClient from "../lib/axiosClient";

export const uploadDocument = (file: File, folderId: string | null) => {
  const formData = new FormData();
  formData.append("file", file);
  if (folderId && folderId !== "root" && folderId !== "dept_root") {
    formData.append("folderId", folderId);
  }
  return axiosClient.post("/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getDocumentStreamUrl = (id: string) => {
  // We can just construct the URL and let the browser fetch it, but we need Auth token.
  // Since we need to pass Auth header, we should fetch it as a blob.
  return axiosClient.get(`/documents/${id}/view`, {
    responseType: "blob",
  });
};

export const getDocumentVersions = (id: string) => {
  return axiosClient.get(`/documents/${id}/versions`);
};

export const getDocumentVersionStreamUrl = (id: string, versionId: string) => {
  return axiosClient.get(`/documents/${id}/versions/${versionId}/view`, {
    responseType: "blob",
  });
};

export const uploadNewDocumentVersion = (documentId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosClient.post(`/documents/${documentId}/versions`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getFolderDocuments = (folderId: string | null) => {
  return axiosClient.get("/documents", { params: { folderId } });
};

export const deleteDocument = (id: string) => {
  return axiosClient.delete(`/documents/${id}`);
};