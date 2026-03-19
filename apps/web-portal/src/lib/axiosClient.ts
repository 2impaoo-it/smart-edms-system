import axios from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ──────────────────────────────────────────────────────
// Tự động đính kèm JWT token vào header Authorization của mỗi request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ─────────────────────────────────────────────────────
// Xử lý lỗi 401 hoặc 403 do bắt buộc đổi mật khẩu: xóa token và đẩy về trang Login
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || (error.response?.status === 403 && error.response?.data?.message === "Bạn phải đổi mật khẩu ở lần đăng nhập đầu tiên")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
