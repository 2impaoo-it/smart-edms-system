# HUTECH Smart EDMS - Feature Implementation Roadmap

## 📋 Overview

Five major features to implement for enhanced document workflow management, security, and notifications.

---

## 🔄 **Feature 1: Document Approval Workflow**

**Status**: Draft → Review → Approve → Signed → Archived

### Backend Requirements (Core Service)

1. **Database Schema Updates**
   - Add `DocumentApprovalStep` entity for tracking workflow steps
   - Add `ApprovalHistory` entity for audit trail
   - Extend `Document` entity with `currentStatus`, `approvalChain`, `dueDate` fields

2. **New Services**
   - `ApprovalWorkflowService`: Manage state transitions
   - `ApprovalNotificationService`: Trigger notifications at each step

3. **REST APIs**
   - `POST /api/v1/documents/{id}/submit-for-review`
   - `POST /api/v1/documents/{id}/approve`
   - `POST /api/v1/documents/{id}/reject` (with reason)
   - `GET /api/v1/documents/{id}/approval-history`
   - `GET /api/v1/approvals/pending` (list pending approvals for user)

### Frontend Updates

1. **Document Status Indicator**
   - Visual badge showing current workflow state
   - Color-coded: Draft (gray), Review (blue), Approve (orange), Signed (green), Archived (dark)

2. **Approval Action Panel**
   - Buttons that appear based on user role and document status
   - Comments/reason field for rejections

3. **Approval Timeline View**
   - Show full approval chain with timestamps and approver details

---

## 🖊️ **Feature 2: Multi-Level Signature/Approval**

**Add support for multiple sequential and parallel approvers**

### Backend Requirements

1. **Database Updates**
   - `ApprovalLevel` entity: Define approval hierarchy (e.g., Manager → Director → CEO)
   - `ApprovalChain` entity: Composite of multiple levels
   - Support both sequential and parallel approval types

2. **Approval Level Service**
   - Validate current level completion before moving to next
   - Support configurable approval paths by document type/category

3. **APIs**
   - `POST /api/v1/approval-chains` (create approval workflow template)
   - `POST /api/v1/documents/{id}/assign-approval-chain`
   - `GET /api/v1/documents/{id}/approval-levels` (show current + pending levels)

### Frontend Updates

1. **Approval Chain Visualization**
   - Flowchart showing sequential steps (1→2→3) or parallel branches
   - Highlight current pending approvers

2. **Multi-Approver Selection UI**
   - When submitting document, allow selecting approval chain template
   - Show preview of who will be in approval queue

---

## 🔐 **Feature 3: PIN Protection for Secure Folders**

**Require PIN entry when accessing sensitive folders, even with folder access permission**

### Backend Requirements

1. **Database Changes**
   - Add `Category` fields: `isSecure` (boolean), `pinHash` (BCrypt)
   - New table `SecureAccessLog`: Track PIN attempts and successful accesses

2. **Security Service**
   - `verifyFolderPin(folderId, pin)`: Check PIN validity
   - Implement rate limiting (max 5 attempts, 15-min lockout)
   - Log all access attempts for audit

3. **APIs**
   - `POST /api/v1/categories/{id}/set-pin` (admin only)
   - `POST /api/v1/categories/{id}/verify-pin` (user request)
   - `GET /api/v1/categories/{id}/is-secure` (check if PIN required)

### Frontend Updates

1. **PIN Entry Modal**
   - Appears when user tries to access secure folder
   - Masked input, attempt counter, lockout notification
   - Cache valid PIN for session (auto-clear on logout)

2. **Admin UI for PIN Management**
   - Set/reset PIN for secure folders
   - View PIN access history

---

## 🔐 **Feature 4: OTP Authentication for Digital Certificates**

**Require OTP (via Microsoft Authentication) when creating digital certificates**

### Backend Requirements

1. **Microsoft Authentication Integration**
   - Setup Azure AD app registration for OTP delivery
   - Implement OAuth2 flow with Microsoft identity platform
   - Use Microsoft Authenticator app for push notifications

2. **OTP Service**
   - `requestOtp(userId, email)`: Trigger OTP delivery via Microsoft
   - `verifyOtp(userId, code, timestamp)`: Validate OTP (5-min expiry)
   - Rate limiting: max 3 verification attempts per OTP

3. **Digital Certificate Service**
   - `createDigitalCertificate(documentId, userId, otp)`: Create cert only after OTP verified
   - `validateCertificate(certId)`: Verify cert authenticity

4. **APIs**
   - `POST /api/v1/certificates/request-otp`
   - `POST /api/v1/certificates/verify-otp` (takes OTP code)
   - `POST /api/v1/certificates/create` (final certificate creation)
   - `GET /api/v1/certificates/{id}` (view cert details + verification)

### Frontend Updates

1. **Certificate Creation Flow**
   - Step 1: User initiates certificate creation
   - Step 2: Trigger OTP via Microsoft Authenticator
   - Step 3: Show OTP verification UI (code input or push approval)
   - Step 4: Confirm certificate created successfully

2. **OTP Status Display**
   - "Waiting for OTP verification..."
   - Show remaining time for OTP validity
   - Fallback SMS/email input if push fails

---

## 📧 **Feature 5: Email Reminder for Documents Nearing Deadline**

**Send email reminders 1 day before approval deadline**

### Backend Requirements

1. **Scheduler Service (Quartz?)** OR **Async Tasks**
   - Daily job that runs at configurable time (e.g., 8 AM)
   - Query documents with `dueDate = tomorrow`
   - Group by approver and send consolidated emails

2. **Email Service Enhancement**
   - `sendApprovalReminderEmail(userId, pendingDocuments)`
   - Template with document name, deadline, direct approval link
   - Respect user notification preferences

3. **APIs**
   - `POST /api/v1/admin/reminders/configure` (set reminder schedule/time)
   - `GET /api/v1/reminders/pending` (show pending reminder emails)
   - `POST /api/v1/reminders/{id}/send-now` (manual trigger)

### Frontend Updates

1. **Notification Preferences**
   - User settings: Enable/disable email reminders
   - Configure reminder frequency (1 day, 2 days, custom)

2. **Dashboard Alert**
   - "X documents need your approval (due tomorrow)"
   - Quick-access link to pending approvals

---

## 📊 Implementation Priority & Timeline

| #   | Feature                 | Phase   | Complexity | Est. Duration |
| --- | ----------------------- | ------- | ---------- | ------------- |
| 1   | Workflow (Draft→Signed) | Phase 1 | Medium     | 5-7 days      |
| 2   | Multi-level Approval    | Phase 1 | High       | 7-10 days     |
| 3   | PIN Protection          | Phase 2 | Low        | 3-5 days      |
| 4   | OTP + Microsoft Auth    | Phase 2 | High       | 8-12 days     |
| 5   | Email Reminders         | Phase 3 | Medium     | 4-6 days      |

**Total**: ~4-5 weeks for full implementation

---

## 🛠️ Technical Considerations

### Database Migrations

- [ ] Create new entities/tables
- [ ] Add indices for approval status queries
- [ ] Plan data migration strategy for existing documents

### Dependencies to Add

**Backend**:

- Spring Scheduler / Quartz
- Microsoft Graph SDK
- JavaMail / Spring Mail
- SendGrid or similar (optional)

**Frontend**:

- OTP input component (already available in React ecosystem)
- Flowchart visualization library (Reactflow?)

### Security Checklist

- [ ] PIN hashing (BCrypt)
- [ ] OTP expiry enforcement
- [ ] Rate limiting on PIN/OTP verification
- [ ] Audit logging for all approval actions
- [ ] Role-based access control for approval chain configuration

### Testing Strategy

- [ ] Unit tests for state transitions
- [ ] Integration tests for multi-step workflows
- [ ] OTP delivery testing (staging environment)
- [ ] End-to-end workflow testing

---

## ✅ Next Steps

1. Review and prioritize features with team
2. Design detailed ER diagrams for new entities
3. Create API specification document
4. Start Phase 1 implementation (Features 1 & 2)
