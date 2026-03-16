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