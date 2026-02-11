import { useState } from "react";
import type { FormEvent } from "react";
import authService from "../services/authService";
import { toast } from "react-toastify";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(username, password);
      toast.success("Đăng nhập thành công!");
      console.log("Token đã được lưu:", response.token);

      // Sau khi đăng nhập thành công, có thể redirect hoặc reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.response) {
        // Server trả về response với status code khác 2xx
        if (error.response.status === 401) {
          toast.error("Sai tên đăng nhập hoặc mật khẩu!");
        } else if (error.response.status === 404) {
          toast.error("API không tồn tại. Vui lòng kiểm tra Backend!");
        } else {
          toast.error(
            `Lỗi: ${error.response.data.message || "Đăng nhập thất bại"}`,
          );
        }
      } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        toast.error("Không thể kết nối đến server. Vui lòng kiểm tra Backend!");
      } else {
        toast.error("Đã xảy ra lỗi: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
