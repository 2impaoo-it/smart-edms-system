import axiosClient from "../lib/axiosClient";

export interface CreateUserRequest {
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  jobTitle?: string;
  role: string;
}

export const createUser = (data: CreateUserRequest) => {
  return axiosClient.post("/users", data);
};

export const getUsers = (params?: { role?: string, status?: string, search?: string }) =>
  axiosClient.get("/users/org-chart", { params });

// ------------------- NEW APIS -------------------
export const getOrgChart = () => axiosClient.get("/users/org-chart");

export const getAllKeystores = () => axiosClient.get("/users/keystore");

export const resetUserKeystore = (id: string | number) => axiosClient.put(`/users/${id}/keystore/reset`);

export const toggleUserStatus = (id: string | number) => axiosClient.put(`/users/${id}/status`);
