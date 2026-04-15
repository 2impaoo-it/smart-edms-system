# 🔄 Feature 1: Document Approval Workflow - Hướng Dẫn Kỹ Thuật

## 📋 Tổng Quan

Đã triển khai workflow duyệt văn bản hoàn chỉnh: **Draft → Review → Approve → Signed → Archived**

---

## 📦 Các Thành Phần Được Tạo

### 1️⃣ **Entity Layer** (Database Models)

| Entity                  | Mục đích                        | Ghi chú                                                                            |
| ----------------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `Document.java`         | Cập nhật thêm approval fields   | `approvalWorkflowId`, `currentApprovalLevel`, `rejectionReason`, `approvalDueDate` |
| `ApprovalWorkflow.java` | Định nghĩa chuỗi duyệt template | Chứa danh sách `ApprovalLevel`                                                     |
| `ApprovalLevel.java`    | Một level trong workflow        | VD: Manager, Director, CEO                                                         |
| `ApprovalHistory.java`  | Ghi lại từng hành động duyệt    | Tracking tất cả phê duyệt/từ chối                                                  |
| `DocumentStatus.java`   | Enum trạng thái văn bản         | DRAFT, REVIEW, APPROVE, SIGNED, ARCHIVED, REJECTED                                 |
| `ApprovalStatus.java`   | Enum trạng thái duyệt           | PENDING, APPROVED, REJECTED, RECALLED                                              |
| `ApprovalType.java`     | Enum loại workflow              | SEQUENTIAL (tuần tự), PARALLEL (song song)                                         |

### 2️⃣ **Repository Layer** (Data Access)

```
ApprovalWorkflowRepository
├── findByIsActiveTrue()
├── findByName(String name)
└── CRUD methods

ApprovalHistoryRepository
├── findByDocumentIdOrderByApprovalLevelAsc()
├── findByApproverIdAndStatus()
├── findApprovalAtLevel()
├── findPendingApprovalsForUser()
└── countByApproverIdAndStatus()
```

### 3️⃣ **Service Layer** (Business Logic)

**ApprovalWorkflowService.java** - 6 methods chính:

| Method                         | Mô tả                                  |
| ------------------------------ | -------------------------------------- |
| `submitForApproval()`          | User submit document từ DRAFT → REVIEW |
| `processApproval()`            | Approver phê duyệt/từ chối             |
| `getApprovalHistory()`         | Lấy lịch sử duyệt                      |
| `getPendingApprovalsForUser()` | Lấy danh sách chờ duyệt                |
| `createWorkflow()`             | Admin tạo workflow template            |
| `getAllWorkflows()`            | Lấy tất cả workflow                    |

### 4️⃣ **DTO Layer** (Data Transfer Objects)

```
ApprovalHistoryDTO.java      - Response khi hiển thị lịch sử duyệt
ApprovalLevelDTO.java         - Mô tả một level duyệt
ApprovalWorkflowDTO.java      - Workflow template
SubmitForApprovalDTO.java     - Request khi submit document
ApprovalActionDTO.java        - Request khi approve/reject
```

### 5️⃣ **Controller Layer** (REST API)

**ApprovalController.java** - 6 endpoints:

```http
# Admin tạo workflow
POST /api/v1/approvals/workflows
Content-Type: application/json
{
  "name": "Phê duyệt 3 cấp",
  "description": "Standard approval workflow",
  "approvalType": "SEQUENTIAL",
  "completionDaysLimit": 7,
  "approvalLevels": [
    {"levelOrder": 1, "levelName": "Quản lý", "approverId": 5},
    {"levelOrder": 2, "levelName": "Giám đốc", "approverId": 7},
    {"levelOrder": 3, "levelName": "Tổng giám đốc", "approverId": 1}
  ]
}

# Lấy danh sách workflow
GET /api/v1/approvals/workflows

# Lấy workflow theo ID
GET /api/v1/approvals/workflows/{id}

# User submit document để duyệt
POST /api/v1/approvals/submit
Content-Type: application/json
{
  "documentId": 123,
  "approvalWorkflowId": 1,
  "submitNotes": "Vui lòng duyệt văn bản này"
}

# Approver phê duyệt/từ chối
POST /api/v1/approvals/process
Content-Type: application/json
{
  "documentId": 123,
  "approved": true,
  "comments": "Tôi đồng ý",
  "rejectionReason": null
}

# Lấy lịch sử duyệt
GET /api/v1/approvals/documents/{documentId}/history

# Lấy danh sách chờ duyệt của user
GET /api/v1/approvals/pending
```

---

## 🗄️ Database Schema

### Approval Workflows Table

```sql
approval_workflows
├── id (PK)
├── name (UNIQUE)
├── description
├── approval_type (SEQUENTIAL|PARALLEL)
├── completion_days_limit
├── is_active
└── created_at
```

### Approval Levels Table

```sql
approval_levels
├── id (PK)
├── workflow_id (FK → approval_workflows)
├── level_order (1, 2, 3, ...)
├── level_name ("Quản lý", "Giám đốc", ...)
├── approver_id (FK → users)
└── description
```

### Approval Histories Table

```sql
approval_histories
├── id (PK)
├── document_id (FK → documents)
├── approval_level (1, 2, 3, ...)
├── approver_id (FK → users)
├── status (PENDING|APPROVED|REJECTED|RECALLED)
├── rejection_reason
├── comments
└── reviewed_at
```

### Documents Table (Updated)

```sql
documents
├── ... (existing fields)
├── approval_workflow_id (FK → approval_workflows)
├── current_approval_level (1, 2, 3, ...)
├── rejection_reason
└── approval_due_date
```

---

## 🔄 Quy trình Duyệt (Workflow)

### 1️⃣ **Draft → Review**

```
User tạo document (Draft)
          ↓
User click "Gửi duyệt"
          ↓
POST /api/v1/approvals/submit
          ↓
- Document status = REVIEW
- ApprovalHistory tạo cho level 1
- Current level = 1
```

### 2️⃣ **Review → Approve (Level 1)**

```
Approver level 1 nhận request
          ↓
Approver xem document
          ↓
POST /api/v1/approvals/process { approved: true }
          ↓
- ApprovalHistory level 1 = APPROVED
- Có level tiếp theo? Nếu có: current_level = 2
- Nếu không: status = SIGNED
```

### 3️⃣ **Multi-Level Approval**

```
Level 1: Draft → REVIEW
         Approver1 xem → APPROVED ✅
         Level 1: APPROVED

Level 2: Approver2 xem → APPROVED ✅
         Level 2: APPROVED

Level 3: Approver3 xem → APPROVED ✅
         Level 3: APPROVED

Kết quả: Document = SIGNED ✅
```

### 4️⃣ **Rejection Flow**

```
Approver level 2 nhận request
          ↓
Xem document → Không đồng ý
          ↓
POST /api/v1/approvals/process {
  approved: false,
  rejectionReason: "Thông tin chưa đầy đủ"
}
          ↓
- ApprovalHistory level 2 = REJECTED
- Document status = DRAFT (quay lại)
- Current level = NULL
- Rejection reason lưu vào document
- User phải sửa lại và gửi duyệt từ đầu
```

---

## 🚀 Cách Sử Dụng

### Setup Ban Đầu:

1. **Chạy database migration**

   ```bash
   # Flyway sẽ tự động chạy V001__Create_Approval_Workflow_Tables.sql
   mvn spring-boot:run
   ```

2. **Tạo workflow template** (Admin)

   ```bash
   curl -X POST http://localhost:8080/api/v1/approvals/workflows \
   -H "Content-Type: application/json" \
   -d '{
     "name": "Phê duyệt 3 cấp",
     "approvalType": "SEQUENTIAL",
     "completionDaysLimit": 7,
     "approvalLevels": [
       {"levelOrder": 1, "levelName": "Quản lý", "approverId": 5},
       {"levelOrder": 2, "levelName": "Giám đốc", "approverId": 7},
       {"levelOrder": 3, "levelName": "Tổng giám đốc", "approverId": 1}
     ]
   }'
   ```

3. **User submit document** (Producer)

   ```bash
   curl -X POST http://localhost:8080/api/v1/approvals/submit \
   -H "Authorization: Bearer TOKEN" \
   -H "Content-Type: application/json" \
   -d '{
     "documentId": 123,
     "approvalWorkflowId": 1,
     "submitNotes": "Vui lòng duyệt"
   }'
   ```

4. **Approver phê duyệt** (Consumer)
   ```bash
   curl -X POST http://localhost:8080/api/v1/approvals/process \
   -H "Authorization: Bearer TOKEN" \
   -H "Content-Type: application/json" \
   -d '{
     "documentId": 123,
     "approved": true,
     "comments": "Đồng ý"
   }'
   ```

---

## 🧪 Unit Tests (Recommended)

```java
@SpringBootTest
class ApprovalWorkflowServiceTest {

    @Test
    void testSubmitForApproval() { }

    @Test
    void testApproveDocument() { }

    @Test
    void testRejectDocument() { }

    @Test
    void testMultiLevelApproval() { }

    @Test
    void testGetPendingApprovalsForUser() { }
}
```

---

## 📝 Tiếp Theo

- ✅ Backend: Feature 1 (Workflow) - HOÀN THÀNH
- ⏳ Backend: Feature 2 (Multi-level signatures) - Nên tích hợp sau
- ⏳ Frontend: Cập nhật UI hiển thị trạng thái, approval history
- ⏳ Feature 3: PIN protection
- ⏳ Feature 4: OTP authentication
- ⏳ Feature 5: Email reminders
