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

export const getUsers = () => {
  return axiosClient.get<any[]>("/users");
};
