import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

interface LoginResponse {
  token: string;
  username?: string;
}

class AuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, {
      username,
      password,
    });

    if (response.data.token) {
      // Lưu token vào localStorage
      localStorage.setItem("token", response.data.token);
      if (response.data.username) {
        localStorage.setItem("username", response.data.username);
      }
    }

    return response.data;
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();
