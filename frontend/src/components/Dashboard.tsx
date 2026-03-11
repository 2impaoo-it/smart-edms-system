import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    console.log("❌ Đã xóa token khỏi localStorage");
    navigate("/login");
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
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <h1 style={{ marginBottom: "20px", textAlign: "center" }}>
          📊 Dashboard
        </h1>

        <div
          style={{
            padding: "20px",
            backgroundColor: "#1a1a1a",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <p style={{ marginBottom: "10px" }}>
            ✅ <strong>Bạn đã đăng nhập thành công!</strong>
          </p>
          <p style={{ marginBottom: "10px" }}>
            🔐 Token:{" "}
            <code
              style={{
                backgroundColor: "#333",
                padding: "2px 6px",
                borderRadius: "3px",
                fontSize: "12px",
              }}
            >
              {token.substring(0, 30)}...
            </code>
          </p>
          <p>📍 Đây là trang được bảo vệ - chỉ truy cập được khi có token</p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          🚪 Đăng Xuất
        </button>

        <div
          style={{
            padding: "20px",
            backgroundColor: "#1a1a1a",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          <p style={{ marginBottom: "10px" }}>
            <strong>🧪 Hướng dẫn test:</strong>
          </p>
          <ol style={{ margin: "5px 0", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "5px" }}>
              Nhấn "Đăng Xuất" để xóa token
            </li>
            <li style={{ marginBottom: "5px" }}>
              Thử truy cập <code>/dashboard</code> trực tiếp → sẽ redirect về{" "}
              <code>/login</code>
            </li>
            <li style={{ marginBottom: "5px" }}>
              Hoặc mở trình duyệt ẩn danh và gõ{" "}
              <code>http://localhost:5173/dashboard</code>
            </li>
            <li style={{ marginBottom: "5px" }}>
              Kết quả: Sẽ bị đá về trang Login vì không có token!
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
