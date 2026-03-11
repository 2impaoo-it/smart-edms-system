# Đề xuất Thiết kế UI/UX Hệ thống SMART-EDMS

Chào đồng nghiệp! Với tư cách là một Senior Fullstack Dev, mình đã xem xét kỹ lưỡng bài toán EDMS (Electronic Document Management System) và các yêu cầu khắt khe của bạn từ chức năng (nghiệp vụ chữ ký số, phân cấp logic thư mục) cho đến thẩm mỹ (Cyberpunk Light, Glassmorphism, Realtime).

Dưới đây là bản **Phân tích yêu cầu & Gợi ý thiết kế (Design Proposal)** cho hệ thống.

---

## 🏗 1. Phân Tích Yêu Cầu & Giới Hạn Nghiệp Vụ (Business Logic)

Hệ thống có 3 nhánh người dùng chính với quyền hạn rõ rệt. Mình map chúng sang các luồng UI tương ứng:

| Role | Quyền Hạn / Tính Năng Core | Gợi ý Bố cục UI |
| :--- | :--- | :--- |
| **Admin** | Quản lý toàn hệ thống (Dashboard tổng, User, Audit Logs, Settings). Không can thiệp sâu vào tài liệu cá nhân của user nhưng kiểm soát luồng data. | Cần một **Master Dashboard** với biểu đồ thống kê tổng quan (ví dụ: lượng file upload/ngày, lưu lượng lưu trữ). Bảng (Table) quản lý User Data-heavy. |
| **Tuyến Trên** (Trưởng phòng/GĐ) | Quản lý tài khoản cá nhân, kho tài liệu cá nhân (Folder tree). **Nhận thông báo realtime** -> **Review/Duyệt/Ký số** tài liệu từ cấp dưới. Quản lý chữ ký số (Tạo/Lưu). | Giao diện tập trung vào **Action Center/Inbox** (tài liệu chờ duyệt). Tích hợp một **PDF Viewer & Signer Workspace** chiếm toàn màn hình để thao tác ký mượt mà. |
| **User/Nhân Viên** | Quản lý tài khoản, kho tài liệu cá nhân (tạo folder/upload). Trình duyệt tài liệu gửi tuyến trên chờ ký. Nhận thông báo kết quả. | Giao diện tập trung vào **File Manager (Drive-like)** (kéo thả upload), Tracking status (Trạng thái văn bản: *Drart, Pending Sign, Signed, Rejected*). |

**Các module Core cần thiết kế kĩ:**
1.  **File Manager Workspace:** Quản lý folder cha/con (Tree-view kết hợp Grid/List view). Tính năng Drag & Drop upload + Convert API feedback (Hiển thị % và loader).
2.  **PDF Signer Workspace:** Khi xem 1 file PDF, user có thể kéo thả chữ ký vào vị trí cụ thể.
3.  **Realtime OS Center:** Thanh sidebar/popover Notifications (chuông) cập nhật liên tục các luồng duyệt văn bản nhờ Socket.io.

---

## 🎨 2. Hệ Thống Thiết Kế: "Cyberpunk Corporate" (Light Mode + Glassmorphism)

Bản brief của bạn rất thú vị: *Cyberpunk Light Mode với độ tương phản cao, kết hợp Glassmorphism*. Thông thường Cyberpunk đi với Dark Mode, nhưng áp dụng nó vào Light Mode cho khối doanh nghiệp (Corporate) sẽ tạo ra một cảm giác "High-tech clean". Mình đề xuất cụ thể:

### 2.1 CSS Variables & Color Palette
Sử dụng Tailwind v4 kết hợp CSS Variables at The Root để dễ dàng switch/theme:

```css
@theme {
  /* Nền tảng sáng, sạch, nhưng hơi ám xanh nhẹ của kính */
  --color-background: #f8fafc; /* Slate 50 */
  --color-surface: rgba(255, 255, 255, 0.7); /* Dành cho Glassmorphism panel */
  
  /* Gradient Primary theo yêu cầu */
  --color-primary-start: #6366f1; /* Indigo 500 */
  --color-primary-end: #a855f7; /* Purple 500 */
  
  /* Nhấn Cyberpunk Contrast (Accents) */
  --color-accent-neon: #14b8a6; /* Teal - cho nút bấm thành công/hoàn thành ký */
  --color-accent-hot: #f43f5e;  /* Rose - cho cảnh báo/hủy/xóa */
  
  /* Text */
  --color-text-main: #0f172a; /* Slate 900 */
  --color-text-muted: #64748b; /* Slate 500 */
}
```

### 2.2 Styling Đặc Trưng (The "Vibe")
1.  **Glassmorphism Container:** Các Card, Sidebar, Modal không dùng màu trắng đặc, mà dùng `bg-white/70 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(99,102,241,0.1)]`. Cảm giác sẽ như bạn đang dùng hệ điều hành trên một tấm rọi kính, rất tương lai.
2.  **Buttons & Active States (Gradient):** Nút CTA chính (Ví dụ: "Ký Tài Liệu", "Upload") sử dụng `bg-gradient-to-r from-indigo-500 to-purple-500 text-white`. Bo góc tù (rounded-lg) thay vì bo tròn (rounded-full) để giữ vẻ chuyên nghiệp.
3.  **Custom Scrollbar:** 
    *   Màu thumb: Indigo-500.
    *   Màu track: Trong suốt.
    *   Thanh mảnh, ẩn khi không hover (tương tự macOS).
4.  **Typography:** Inter hoặc Plus Jakarta Sans. Sạch sẽ, dễ đọc ở kích thước nhỏ (vì EDMS nhiều text).
5.  **Micro-interactions (Framer Motion):** 
    *   Click vào thư mục: Thư mục có hiệu ứng scale down nhẹ `scale: 0.98`.
    *   Popover thông báo: Trượt từ trên xuống `y: -10 -> 0`, `opacity: 0 -> 1` khi có tin mới.
    *   Trạng thái tải file / Convert PDF: Dùng vòng gradient xoay liên tục.

---

## 🖥 3. Phác thảo Layout Kiến trúc Chứa (Layout Architecture)

Mình gợi ý thiết kế App shell thành **3 khu vực (3-Column Layout/Sidebar)** mô phỏng các công cụ Pro như Notion hay Linear:

*   **Left Sidebar (Glassmorphism):** Trượt, chứa Navigation Menu (Dashboard, My Files, Shared with me, Pending Signatures, Settings). Phía dưới cùng là hiển thị dung lượng kho lưu trữ.
*   **Top Header (Sticky & Blur):**
    *   Trái: Breadcrumbs (`Phòng IT > Tài liệu mật > Hợp đồng.pdf`) giúp user biết đang ở đâu trong cụm thư mục.
    *   Giữa: Global Search Bar lớn có hint phím tắt `Ctrl + K`. Mọi thứ tìm kiếm file diễn ra ở đây.
    *   Phải: Notification Bell (chấm đỏ báo realtime ping) và User Profile Menu (Avatar).
*   **Main Content Area:**
    *   Phần nền xám sáng `bg-slate-50`. Nơi render các Router Page. Thẻ (Cards) hoặc danh sách (Table/List) hiển thị tài liệu nổi lên trên bề mặt.
    *   Layout của Explorer File (nơi quản lý cha/con) nên giống Google Drive nhưng phẳng hơn: 1 vùng dropzone lớn để kéo file vào -> Upload tự động -> Trigger API Convert PDF sang. 

---

## ✍️ 4. Nghiệp vụ chuyên sâu: Trình Ký & Tracking

Đây là lõi của EDMS, UI cần phải làm người dùng thao tác không bị dội:
*   **Visual Workflow Track:** Khi nhân viên tạo 1 trình ký, tài liệu đó sẽ hiển thị một Component Stepper theo chiều ngang hoặc dọc: `[Draft] -> [Sent to Trưởng Phòng] (Realtime pulsing animation) -> [Signed / Rejected]`.
*   **PDF Workstation (Chỗ Trưởng phòng ký):**
    *   Chia màn hình: 70% bên trái là trình render PDF (Canvas/PDF.js).
    *   30% bên phải là **Action Panel**: Thông tin người gửi, Ghi chú, và Nút **"Áp Chữ Ký"**.
    *   Trường hợp chưa có chữ ký, pop-up hiện ra yêu cầu vẽ chữ ký (Canvas) hoặc upload ảnh chữ ký. Chữ ký sau đó được lưu lại. Người dùng có thể kéo (Drag) chữ ký thả vào văn bản PDF (Tạo element overlay vị trí X, Y để gửi về backend).

---

## ⚡ Góc nhìn Fullstack & Sự phối hợp đồng nghiệp

*Với tư cách đồng nghiệp,* mình thấy prompt của bạn định hướng **quá chuẩn và hiện đại**. Mình sẽ phụ trách code các thành phần (Component) dựa trên TailwindCSS v4 và React (như cấu hình hiện tại trong `apps/web-portal`). 

**Bạn đánh giá sao về đề xuất Design System (Màu sắc, Glassmorphism, Layout) và cách bố trí luồng Ký tài liệu trên?** Chúng ta có thể thực hiện setup `index.css` và `tailwind.config` cho bộ màu và CSS variable này ngay lập tức!
