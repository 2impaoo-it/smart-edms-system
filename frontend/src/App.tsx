import Login from "./components/Login";
import authService from "./services/authService";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const isLoggedIn = authService.isLoggedIn();

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  if (!isLoggedIn) {
    return (
      <>
        <Login />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </>
    );
  }

  return (
    <>
      <div style={{ padding: "2rem" }}>
        <h1>Chào mừng bạn đã đăng nhập!</h1>
        <p>Token đã được lưu vào localStorage</p>
        <p>Username: {localStorage.getItem("username")}</p>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            marginTop: "1rem",
            cursor: "pointer",
          }}
        >
          Đăng xuất
        </button>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
