import axiosClient from "../lib/axiosClient";

// ─── OTP Service (Email) ───────────────────────────────────────────────────

/**
 * Yêu cầu gửi OTP qua email
 * purpose: DIGITAL_CERT_CREATION | SIGNATURE | PASSWORD_RESET | TWO_FACTOR_AUTH
 */
export const requestOtp = (purpose: string) =>
  axiosClient.post("/v1/otp/generate", { purpose, deliveryMethod: "EMAIL" });

/**
 * Xác thực OTP (Email) – gửi kèm deliveryMethod để backend phân biệt nhánh verify
 */
export const verifyOtp = (otpCode: string, purpose: string, deliveryMethod = "EMAIL") =>
  axiosClient.post("/v1/otp/verify", { otpCode, purpose, deliveryMethod });

// ─── TOTP Service (Microsoft / Google Authenticator) ──────────────────────

/**
 * Khởi động TOTP cho Microsoft Authenticator.
 * Response:
 *  { requiresSetup: true,  qrCodeUri: "otpauth://...", secretKey: "BASE32..." }  ← lần đầu
 *  { requiresSetup: false, message: "Mở app nhập mã" }                           ← đã setup
 */
export const requestTotpOtp = (purpose: string) =>
  axiosClient.post("/v1/otp/generate", { purpose, deliveryMethod: "MICROSOFT_AUTH" });

/**
 * Xác nhận setup TOTP lần đầu (sau khi quét QR).
 * Nếu thành công backend sẽ set mfaEnabled = true cho user.
 */
export const confirmTotpSetup = (otpCode: string) =>
  axiosClient.post("/v1/otp/totp/setup-confirm", { otpCode });

/**
 * Xác thực mã TOTP (từ lần 2 trở đi, không cần quét QR nữa)
 */
export const verifyTotpOtp = (otpCode: string, purpose: string) =>
  axiosClient.post("/v1/otp/verify", { otpCode, purpose, deliveryMethod: "MICROSOFT_AUTH" });



// ─── Reminder Service ────────────────────────────────────────────────────────

/**
 * Lấy danh sách nhắc hẹn đã gửi cho user hiện tại
 */
export const getMyReminders = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user || (!user.id && !user._id)) return Promise.reject("No user ID");
  const userId = user.id || user._id;
  return axiosClient.get(`/v1/reminders/history/${userId}`);
};

/**
 * Trigger thủ công kiểm tra và gửi reminder (Admin only)
 */
export const triggerReminderCheck = () =>
  axiosClient.post("/v1/reminders/trigger-now");

/**
 * Lấy thống kê reminders (Admin)
 */
export const getReminderStats = () =>
  axiosClient.get("/v1/reminders/stats");
