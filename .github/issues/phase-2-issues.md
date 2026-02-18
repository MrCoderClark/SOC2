# Phase 2 Issues - Core Compliance Features

Use these to create GitHub Issues. Copy each section as a new issue.

---

## Issue #8: Organization Management

**Labels:** `phase: 2-core`, `type: feature`, `priority: critical`, `component: backend`, `component: frontend`

### Description
Implement organization/company management for multi-tenant support.

### Tasks
- [ ] Create organization CRUD API endpoints
- [ ] Build organization settings page
- [ ] Implement organization switching for users in multiple orgs
- [ ] Add organization branding (logo, name)
- [ ] Create organization invitation system

### Acceptance Criteria
- [ ] Users can create and manage organizations
- [ ] Users can invite team members
- [ ] Organization data is properly isolated

---

## Issue #9: SOC 2 Framework Data Model

**Labels:** `phase: 2-core`, `type: feature`, `priority: critical`, `component: database`, `component: backend`

### Description
Implement the complete SOC 2 Trust Service Criteria data model.

### Tasks
- [ ] Create Framework model with versioning
- [ ] Create Category model (Security, Availability, etc.)
- [ ] Create Control model with full SOC 2 control library
- [ ] Create ControlMapping for org-specific implementations
- [ ] Seed database with all SOC 2 Type II controls
- [ ] Add control relationships and dependencies

### Acceptance Criteria
- [ ] All 60+ SOC 2 controls are seeded
- [ ] Controls are organized by Trust Service Criteria
- [ ] Control mappings track org-specific status

---

## Issue #10: Control Status Tracking

**Labels:** `phase: 2-core`, `type: feature`, `priority: critical`, `component: frontend`, `component: backend`

### Description
Build the control tracking interface for monitoring compliance status.

### Tasks
- [ ] Create controls list view with filtering/sorting
- [ ] Build control detail page
- [ ] Implement status workflow (Not Started → In Progress → Implemented → Verified)
- [ ] Add control owner assignment
- [ ] Create control notes and comments
- [ ] Build progress indicators and metrics

### Acceptance Criteria
- [ ] Users can view all controls and their status
- [ ] Status can be updated with audit trail
- [ ] Progress percentage is calculated correctly

---

## Issue #11: Evidence Management

**Labels:** `phase: 2-core`, `type: feature`, `priority: critical`, `component: frontend`, `component: backend`

### Description
Implement evidence upload, storage, and linking to controls.

### Tasks
- [ ] Set up S3/R2 file storage
- [ ] Create evidence upload API with validation
- [ ] Build evidence library UI
- [ ] Implement evidence-to-control linking
- [ ] Add evidence metadata (type, date, description)
- [ ] Create evidence versioning
- [ ] Build evidence preview for common file types

### Acceptance Criteria
- [ ] Users can upload files as evidence
- [ ] Evidence can be linked to multiple controls
- [ ] File previews work for images, PDFs

---

## Issue #12: Policy Document Management

**Labels:** `phase: 2-core`, `type: feature`, `priority: high`, `component: frontend`, `component: backend`

### Description
Build policy document creation and management system.

### Tasks
- [ ] Create policy CRUD API
- [ ] Build rich text editor for policies
- [ ] Implement policy templates library
- [ ] Add policy versioning and history
- [ ] Create policy approval workflow
- [ ] Link policies to controls
- [ ] Add policy export (PDF, Word)

### Acceptance Criteria
- [ ] Users can create and edit policies
- [ ] Policy versions are tracked
- [ ] Policies can be exported

---

## Issue #13: Compliance Dashboard

**Labels:** `phase: 2-core`, `type: feature`, `priority: high`, `component: frontend`

### Description
Create the main compliance dashboard with progress metrics and visualizations.

### Tasks
- [ ] Build overall compliance score widget
- [ ] Create progress by category chart
- [ ] Add recent activity feed
- [ ] Build upcoming tasks/deadlines widget
- [ ] Create control status breakdown chart
- [ ] Add evidence collection progress
- [ ] Implement dashboard customization

### Acceptance Criteria
- [ ] Dashboard shows real-time compliance status
- [ ] Charts are interactive and informative
- [ ] Key metrics are prominently displayed

---

## Issue #14: User Roles and Permissions

**Labels:** `phase: 2-core`, `type: feature`, `priority: high`, `component: auth`, `component: backend`

### Description
Implement role-based access control for the platform.

### Tasks
- [ ] Define role hierarchy (Admin, Compliance Manager, Contributor, Viewer)
- [ ] Create permission matrix
- [ ] Implement RBAC middleware in NestJS
- [ ] Add role management UI
- [ ] Create permission checks in frontend
- [ ] Add audit logging for permission changes

### Acceptance Criteria
- [ ] Roles restrict access appropriately
- [ ] Admins can manage user roles
- [ ] Permission changes are logged

---

## Issue #15: Activity Audit Log

**Labels:** `phase: 2-core`, `type: feature`, `priority: medium`, `component: backend`, `component: frontend`

### Description
Implement comprehensive audit logging for compliance tracking.

### Tasks
- [ ] Create audit log data model
- [ ] Log all CRUD operations on compliance data
- [ ] Build audit log viewer UI
- [ ] Add filtering and search
- [ ] Implement log export
- [ ] Add user activity timeline

### Acceptance Criteria
- [ ] All changes are logged with user, timestamp, and details
- [ ] Audit logs are searchable and filterable
- [ ] Logs can be exported for auditors
