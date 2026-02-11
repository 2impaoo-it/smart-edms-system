import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username && password) {
      // Lưu token vào localStorage
      localStorage.setItem("token", "demo-token-" + Date.now());
      console.log("✅ Đã lưu token vào localStorage");

      // Chuyển hướng đến dashboard
      navigate("/dashboard");
    } else {
      alert("Vui lòng nhập username và password");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#242424",
          padding: "40px",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h1 style={{ marginBottom: "30px", textAlign: "center" }}>🔐 Login</h1>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                borderRadius: "4px",
                border: "1px solid #646cff",
                boxSizing: "border-box",
                backgroundColor: "#1a1a1a",
                color: "white",
              }}
              placeholder="Nhập username"
            />
          </div>

          <div style={{ marginBottom: "30px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                borderRadius: "4px",
                border: "1px solid #646cff",
                boxSizing: "border-box",
                backgroundColor: "#1a1a1a",
                color: "white",
              }}
              placeholder="Nhập password"
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: "#646cff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Đăng Nhập
          </button>
        </form>

        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#1a1a1a",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          <p>
            <strong>💡 Test:</strong>
          </p>
          <p style={{ margin: "5px 0" }}>
            Nhập bất kỳ username/password nào để đăng nhập
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
