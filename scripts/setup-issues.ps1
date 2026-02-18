# GitHub Issues Setup Script
# Creates all 35 issues for the SOC 2 Compliance Platform

Write-Host "Creating GitHub Issues..." -ForegroundColor Cyan
Write-Host "This will create 35 issues across 5 phases.`n" -ForegroundColor Yellow

# Phase 1 Issues - Foundation
$phase1Issues = @(
    @{
        title = "[TASK] Initialize Monorepo Structure"
        labels = "phase: 1-foundation,type: task,priority: critical,component: backend,component: frontend"
        milestone = "v0.1.0 - Foundation"
        body = @"
## Description
Set up the monorepo structure using pnpm workspaces with Next.js frontend and NestJS backend.

## Tasks
- [ ] Initialize pnpm workspace
- [ ] Create apps/web - Next.js 14 with App Router
- [ ] Create apps/api - NestJS application
- [ ] Create packages/shared - Shared types and utilities
- [ ] Create packages/database - Prisma schema and client
- [ ] Configure TypeScript paths and references
- [ ] Set up ESLint and Prettier
- [ ] Create root scripts for dev, build, test

## Acceptance Criteria
- [ ] pnpm dev starts both frontend and backend
- [ ] pnpm build builds all packages
- [ ] TypeScript compilation works across packages
"@
    },
    @{
        title = "[TASK] Database Schema Design"
        labels = "phase: 1-foundation,type: task,priority: critical,component: database"
        milestone = "v0.1.0 - Foundation"
        body = @"
## Description
Design and implement the initial PostgreSQL database schema using Prisma.

## Tasks
- [ ] Design ERD for core entities
- [ ] Create Prisma schema with models: Organization, User, Framework, Control, Evidence, Policy, AuditLog
- [ ] Set up database migrations
- [ ] Create seed data for SOC 2 controls
- [ ] Configure Prisma client generation

## Acceptance Criteria
- [ ] Migrations run successfully
- [ ] Seed data populates SOC 2 framework
- [ ] Prisma client is generated and typed
"@
    },
    @{
        title = "[FEATURE] Authentication System"
        labels = "phase: 1-foundation,type: feature,priority: critical,component: auth"
        milestone = "v0.1.0 - Foundation"
        body = @"
## Description
Implement authentication using Clerk or Auth0 with support for email/password and OAuth.

## Tasks
- [ ] Choose and configure auth provider (Clerk recommended)
- [ ] Set up auth middleware in NestJS
- [ ] Implement protected routes in Next.js
- [ ] Create user sync between auth provider and database
- [ ] Implement organization-based multi-tenancy
- [ ] Add role-based access control (RBAC)

## Acceptance Criteria
- [ ] Users can sign up and log in
- [ ] OAuth works (Google, GitHub)
- [ ] Protected routes redirect to login
- [ ] User data syncs to database
"@
    },
    @{
        title = "[FEATURE] Basic UI Shell"
        labels = "phase: 1-foundation,type: feature,priority: high,component: frontend"
        milestone = "v0.1.0 - Foundation"
        body = @"
## Description
Create the basic application shell with navigation, layout, and core UI components.

## Tasks
- [ ] Set up TailwindCSS and shadcn/ui
- [ ] Create app layout with sidebar navigation
- [ ] Implement responsive design
- [ ] Create core pages: Dashboard, Controls, Evidence, Policies, Settings
- [ ] Add loading states and error boundaries
- [ ] Implement dark mode support

## Acceptance Criteria
- [ ] Navigation works between all pages
- [ ] Layout is responsive on mobile/tablet/desktop
- [ ] Dark mode toggle works
- [ ] Loading states display correctly
"@
    },
    @{
        title = "[TASK] CI/CD Pipeline"
        labels = "phase: 1-foundation,type: task,priority: high"
        milestone = "v0.1.0 - Foundation"
        body = @"
## Description
Set up GitHub Actions for continuous integration and deployment.

## Tasks
- [ ] Create workflow for PR checks (lint, type-check, test)
- [ ] Create workflow for main branch deployment
- [ ] Set up environment variables in GitHub Secrets
- [ ] Configure preview deployments for PRs
- [ ] Add database migration step to deployment

## Acceptance Criteria
- [ ] PRs run automated checks
- [ ] Main branch auto-deploys to staging
- [ ] Preview URLs generated for PRs
"@
    },
    @{
        title = "[TASK] API Foundation"
        labels = "phase: 1-foundation,type: task,priority: high,component: backend"
        milestone = "v0.1.0 - Foundation"
        body = @"
## Description
Set up the NestJS API with core modules and middleware.

## Tasks
- [ ] Configure NestJS with proper module structure
- [ ] Set up Swagger/OpenAPI documentation
- [ ] Implement global exception handling
- [ ] Add request validation with class-validator
- [ ] Configure CORS and security headers
- [ ] Set up logging with structured output
- [ ] Create health check endpoint

## Acceptance Criteria
- [ ] API documentation available at /api/docs
- [ ] Validation errors return proper responses
- [ ] Logs are structured and queryable
"@
    },
    @{
        title = "[TASK] Environment Configuration"
        labels = "phase: 1-foundation,type: task,priority: medium"
        milestone = "v0.1.0 - Foundation"
        body = @"
## Description
Set up environment configuration for local development and production.

## Tasks
- [ ] Create .env.example files
- [ ] Set up environment validation with Zod
- [ ] Configure different environments (dev, staging, prod)
- [ ] Document required environment variables
- [ ] Set up Docker Compose for local development

## Acceptance Criteria
- [ ] App fails fast on missing env vars
- [ ] Docker Compose starts all services
- [ ] Environment docs are complete
"@
    }
)

# Phase 2 Issues - Core Features
$phase2Issues = @(
    @{
        title = "[FEATURE] Organization Management"
        labels = "phase: 2-core,type: feature,priority: critical,component: backend,component: frontend"
        milestone = "v0.2.0 - Core Features"
        body = @"
## Description
Implement organization/company management for multi-tenant support.

## Tasks
- [ ] Create organization CRUD API endpoints
- [ ] Build organization settings page
- [ ] Implement organization switching for users in multiple orgs
- [ ] Add organization branding (logo, name)
- [ ] Create organization invitation system

## Acceptance Criteria
- [ ] Users can create and manage organizations
- [ ] Users can invite team members
- [ ] Organization data is properly isolated
"@
    },
    @{
        title = "[FEATURE] SOC 2 Framework Data Model"
        labels = "phase: 2-core,type: feature,priority: critical,component: database,component: backend"
        milestone = "v0.2.0 - Core Features"
        body = @"
## Description
Implement the complete SOC 2 Trust Service Criteria data model.

## Tasks
- [ ] Create Framework model with versioning
- [ ] Create Category model (Security, Availability, etc.)
- [ ] Create Control model with full SOC 2 control library
- [ ] Create ControlMapping for org-specific implementations
- [ ] Seed database with all SOC 2 Type II controls
- [ ] Add control relationships and dependencies

## Acceptance Criteria
- [ ] All 60+ SOC 2 controls are seeded
- [ ] Controls are organized by Trust Service Criteria
- [ ] Control mappings track org-specific status
"@
    },
    @{
        title = "[FEATURE] Control Status Tracking"
        labels = "phase: 2-core,type: feature,priority: critical,component: frontend,component: backend"
        milestone = "v0.2.0 - Core Features"
        body = @"
## Description
Build the control tracking interface for monitoring compliance status.

## Tasks
- [ ] Create controls list view with filtering/sorting
- [ ] Build control detail page
- [ ] Implement status workflow (Not Started -> In Progress -> Implemented -> Verified)
- [ ] Add control owner assignment
- [ ] Create control notes and comments
- [ ] Build progress indicators and metrics

## Acceptance Criteria
- [ ] Users can view all controls and their status
- [ ] Status can be updated with audit trail
- [ ] Progress percentage is calculated correctly
"@
    },
    @{
        title = "[FEATURE] Evidence Management"
        labels = "phase: 2-core,type: feature,priority: critical,component: frontend,component: backend"
        milestone = "v0.2.0 - Core Features"
        body = @"
## Description
Implement evidence upload, storage, and linking to controls.

## Tasks
- [ ] Set up S3/R2 file storage
- [ ] Create evidence upload API with validation
- [ ] Build evidence library UI
- [ ] Implement evidence-to-control linking
- [ ] Add evidence metadata (type, date, description)
- [ ] Create evidence versioning
- [ ] Build evidence preview for common file types

## Acceptance Criteria
- [ ] Users can upload files as evidence
- [ ] Evidence can be linked to multiple controls
- [ ] File previews work for images, PDFs
"@
    },
    @{
        title = "[FEATURE] Policy Document Management"
        labels = "phase: 2-core,type: feature,priority: high,component: frontend,component: backend"
        milestone = "v0.2.0 - Core Features"
        body = @"
## Description
Build policy document creation and management system.

## Tasks
- [ ] Create policy CRUD API
- [ ] Build rich text editor for policies
- [ ] Implement policy templates library
- [ ] Add policy versioning and history
- [ ] Create policy approval workflow
- [ ] Link policies to controls
- [ ] Add policy export (PDF, Word)

## Acceptance Criteria
- [ ] Users can create and edit policies
- [ ] Policy versions are tracked
- [ ] Policies can be exported
"@
    },
    @{
        title = "[FEATURE] Compliance Dashboard"
        labels = "phase: 2-core,type: feature,priority: high,component: frontend"
        milestone = "v0.2.0 - Core Features"
        body = @"
## Description
Create the main compliance dashboard with progress metrics and visualizations.

## Tasks
- [ ] Build overall compliance score widget
- [ ] Create progress by category chart
- [ ] Add recent activity feed
- [ ] Build upcoming tasks/deadlines widget
- [ ] Create control status breakdown chart
- [ ] Add evidence collection progress
- [ ] Implement dashboard customization

## Acceptance Criteria
- [ ] Dashboard shows real-time compliance status
- [ ] Charts are interactive and informative
- [ ] Key metrics are prominently displayed
"@
    },
    @{
        title = "[FEATURE] User Roles and Permissions"
        labels = "phase: 2-core,type: feature,priority: high,component: auth,component: backend"
        milestone = "v0.2.0 - Core Features"
        body = @"
## Description
Implement role-based access control for the platform.

## Tasks
- [ ] Define role hierarchy (Admin, Compliance Manager, Contributor, Viewer)
- [ ] Create permission matrix
- [ ] Implement RBAC middleware in NestJS
- [ ] Add role management UI
- [ ] Create permission checks in frontend
- [ ] Add audit logging for permission changes

## Acceptance Criteria
- [ ] Roles restrict access appropriately
- [ ] Admins can manage user roles
- [ ] Permission changes are logged
"@
    },
    @{
        title = "[FEATURE] Activity Audit Log"
        labels = "phase: 2-core,type: feature,priority: medium,component: backend,component: frontend"
        milestone = "v0.2.0 - Core Features"
        body = @"
## Description
Implement comprehensive audit logging for compliance tracking.

## Tasks
- [ ] Create audit log data model
- [ ] Log all CRUD operations on compliance data
- [ ] Build audit log viewer UI
- [ ] Add filtering and search
- [ ] Implement log export
- [ ] Add user activity timeline

## Acceptance Criteria
- [ ] All changes are logged with user, timestamp, and details
- [ ] Audit logs are searchable and filterable
- [ ] Logs can be exported for auditors
"@
    }
)

# Phase 3 Issues - Integrations
$phase3Issues = @(
    @{
        title = "[TASK] Integration Framework Architecture"
        labels = "phase: 3-integrations,type: task,priority: critical,component: backend,component: integrations"
        milestone = "v0.3.0 - Integrations"
        body = @"
## Description
Design and implement the core integration framework for connecting third-party services.

## Tasks
- [ ] Design integration abstraction layer
- [ ] Create OAuth2 flow handler
- [ ] Build credential storage (encrypted)
- [ ] Implement webhook receiver infrastructure
- [ ] Create integration health monitoring
- [ ] Build integration management UI

## Acceptance Criteria
- [ ] New integrations can be added with minimal code
- [ ] OAuth flow works for supported providers
- [ ] Credentials are securely stored
"@
    },
    @{
        title = "[FEATURE] AWS Integration"
        labels = "phase: 3-integrations,type: feature,priority: high,component: integrations"
        milestone = "v0.3.0 - Integrations"
        body = @"
## Description
Integrate with AWS to collect compliance evidence automatically.

## Tasks
- [ ] Implement AWS credential configuration (IAM role/access keys)
- [ ] Collect IAM policies and users
- [ ] Collect S3 bucket configurations
- [ ] Collect CloudTrail logs
- [ ] Collect Security Hub findings
- [ ] Map AWS resources to SOC 2 controls

## Acceptance Criteria
- [ ] AWS account can be connected
- [ ] Evidence is auto-collected on schedule
- [ ] Resources map to relevant controls
"@
    },
    @{
        title = "[FEATURE] GitHub Integration"
        labels = "phase: 3-integrations,type: feature,priority: high,component: integrations"
        milestone = "v0.3.0 - Integrations"
        body = @"
## Description
Integrate with GitHub for code repository compliance evidence.

## Tasks
- [ ] Implement GitHub OAuth app
- [ ] Collect repository settings (branch protection, etc.)
- [ ] Collect organization members and permissions
- [ ] Monitor for security alerts
- [ ] Collect PR review requirements
- [ ] Map to change management controls

## Acceptance Criteria
- [ ] GitHub org can be connected
- [ ] Repo security settings are collected
- [ ] Evidence links to relevant controls
"@
    },
    @{
        title = "[FEATURE] Google Workspace Integration"
        labels = "phase: 3-integrations,type: feature,priority: medium,component: integrations"
        milestone = "v0.3.0 - Integrations"
        body = @"
## Description
Integrate with Google Workspace for identity and access evidence.

## Tasks
- [ ] Implement Google OAuth with admin scopes
- [ ] Collect user directory
- [ ] Collect security settings
- [ ] Monitor login activity
- [ ] Collect 2FA enrollment status
- [ ] Map to access control controls

## Acceptance Criteria
- [ ] Google Workspace can be connected
- [ ] User and security data is collected
- [ ] 2FA status is tracked
"@
    },
    @{
        title = "[FEATURE] Slack Integration"
        labels = "phase: 3-integrations,type: feature,priority: medium,component: integrations"
        milestone = "v0.3.0 - Integrations"
        body = @"
## Description
Integrate with Slack for notifications and compliance alerts.

## Tasks
- [ ] Implement Slack OAuth app
- [ ] Create notification channels configuration
- [ ] Send alerts for control status changes
- [ ] Send reminders for pending tasks
- [ ] Create Slack commands for quick status checks

## Acceptance Criteria
- [ ] Slack workspace can be connected
- [ ] Notifications are sent to configured channels
- [ ] Users can check status via Slack
"@
    },
    @{
        title = "[FEATURE] Automated Evidence Collection"
        labels = "phase: 3-integrations,type: feature,priority: critical,component: backend,component: integrations"
        milestone = "v0.3.0 - Integrations"
        body = @"
## Description
Build the automated evidence collection system using background jobs.

## Tasks
- [ ] Set up BullMQ job queue
- [ ] Create evidence collection job for each integration
- [ ] Implement scheduling (daily, weekly, monthly)
- [ ] Build evidence diff detection (only store changes)
- [ ] Create collection status dashboard
- [ ] Add manual trigger option

## Acceptance Criteria
- [ ] Evidence is collected on schedule
- [ ] Only new/changed evidence is stored
- [ ] Collection status is visible in UI
"@
    },
    @{
        title = "[FEATURE] Compliance Monitoring and Alerts"
        labels = "phase: 3-integrations,type: feature,priority: high,component: backend,component: frontend"
        milestone = "v0.3.0 - Integrations"
        body = @"
## Description
Implement real-time compliance monitoring with alerting.

## Tasks
- [ ] Define compliance rules engine
- [ ] Create alert conditions (control drift, missing evidence, etc.)
- [ ] Build alert management UI
- [ ] Implement alert routing (email, Slack, in-app)
- [ ] Add alert acknowledgment workflow
- [ ] Create compliance score impact tracking

## Acceptance Criteria
- [ ] Alerts fire when compliance issues detected
- [ ] Users receive notifications via preferred channel
- [ ] Alerts can be acknowledged and resolved
"@
    }
)

# Phase 4 Issues - AI Features
$phase4Issues = @(
    @{
        title = "[TASK] AI Infrastructure Setup"
        labels = "phase: 4-ai,type: task,priority: critical,component: ai,component: backend"
        milestone = "v0.4.0 - AI Features"
        body = @"
## Description
Set up the AI infrastructure for LLM-powered features.

## Tasks
- [ ] Configure OpenAI/Anthropic API integration
- [ ] Create AI service abstraction layer
- [ ] Implement token usage tracking and limits
- [ ] Set up prompt templates management
- [ ] Create AI response caching
- [ ] Add fallback handling for API failures

## Acceptance Criteria
- [ ] AI APIs are integrated and working
- [ ] Token usage is tracked per organization
- [ ] Prompts are versioned and manageable
"@
    },
    @{
        title = "[FEATURE] AI Policy Generation"
        labels = "phase: 4-ai,type: feature,priority: high,component: ai,component: frontend"
        milestone = "v0.4.0 - AI Features"
        body = @"
## Description
Implement AI-powered policy document generation.

## Tasks
- [ ] Create policy generation prompts for each policy type
- [ ] Build policy wizard UI with company context input
- [ ] Implement policy customization based on org profile
- [ ] Add policy review and edit workflow
- [ ] Create policy improvement suggestions
- [ ] Support multiple policy formats

## Acceptance Criteria
- [ ] Users can generate policies with AI
- [ ] Policies are customized to organization
- [ ] Generated policies meet SOC 2 requirements
"@
    },
    @{
        title = "[FEATURE] Security Questionnaire Automation"
        labels = "phase: 4-ai,type: feature,priority: high,component: ai,component: frontend"
        milestone = "v0.4.0 - AI Features"
        body = @"
## Description
Build AI-powered security questionnaire completion.

## Tasks
- [ ] Create questionnaire upload/import (CSV, Excel, PDF)
- [ ] Build question parsing and categorization
- [ ] Implement AI answer generation from compliance data
- [ ] Create answer review and approval workflow
- [ ] Build questionnaire export
- [ ] Add answer library for common questions

## Acceptance Criteria
- [ ] Questionnaires can be uploaded
- [ ] AI generates answers based on compliance posture
- [ ] Answers can be reviewed and exported
"@
    },
    @{
        title = "[FEATURE] AI Gap Analysis"
        labels = "phase: 4-ai,type: feature,priority: medium,component: ai,component: frontend"
        milestone = "v0.4.0 - AI Features"
        body = @"
## Description
Implement AI-assisted compliance gap analysis.

## Tasks
- [ ] Analyze current compliance state
- [ ] Identify gaps and missing controls
- [ ] Generate prioritized remediation plan
- [ ] Estimate effort for each gap
- [ ] Create gap report export
- [ ] Track gap closure progress

## Acceptance Criteria
- [ ] AI identifies compliance gaps
- [ ] Remediation steps are actionable
- [ ] Progress is tracked over time
"@
    },
    @{
        title = "[FEATURE] AI Code Scanning"
        labels = "phase: 4-ai,type: feature,priority: medium,component: ai,component: integrations"
        milestone = "v0.4.0 - AI Features"
        body = @"
## Description
Implement AI-powered code scanning for security issues.

## Tasks
- [ ] Integrate with GitHub repos
- [ ] Scan for hardcoded secrets
- [ ] Identify security vulnerabilities
- [ ] Check for compliance-related code patterns
- [ ] Generate findings report
- [ ] Create remediation suggestions

## Acceptance Criteria
- [ ] Code repos can be scanned
- [ ] Security issues are identified
- [ ] Findings link to relevant controls
"@
    },
    @{
        title = "[FEATURE] Smart Remediation Suggestions"
        labels = "phase: 4-ai,type: feature,priority: medium,component: ai,component: frontend"
        milestone = "v0.4.0 - AI Features"
        body = @"
## Description
Provide AI-driven remediation suggestions for compliance issues.

## Tasks
- [ ] Analyze control implementation gaps
- [ ] Generate step-by-step remediation guides
- [ ] Provide environment-specific instructions
- [ ] Link to relevant documentation
- [ ] Track remediation completion
- [ ] Learn from successful remediations

## Acceptance Criteria
- [ ] Suggestions are specific and actionable
- [ ] Instructions match user's tech stack
- [ ] Completion can be tracked
"@
    }
)

# Phase 5 Issues - Enterprise
$phase5Issues = @(
    @{
        title = "[FEATURE] Multi-Framework Support"
        labels = "phase: 5-enterprise,type: feature,priority: critical,component: backend,component: frontend"
        milestone = "v1.0.0 - Enterprise"
        body = @"
## Description
Extend the platform to support multiple compliance frameworks.

## Tasks
- [ ] Add HIPAA framework and controls
- [ ] Add GDPR framework and controls
- [ ] Add ISO 27001 framework and controls
- [ ] Implement control mapping across frameworks
- [ ] Create unified compliance view
- [ ] Build framework comparison reports

## Acceptance Criteria
- [ ] Multiple frameworks can be tracked
- [ ] Controls map across frameworks
- [ ] Single evidence can satisfy multiple frameworks
"@
    },
    @{
        title = "[FEATURE] Trust Portal"
        labels = "phase: 5-enterprise,type: feature,priority: high,component: frontend"
        milestone = "v1.0.0 - Enterprise"
        body = @"
## Description
Build a public-facing trust portal for sharing compliance status.

## Tasks
- [ ] Create public trust page with custom subdomain
- [ ] Display compliance certifications
- [ ] Show security practices summary
- [ ] Add document download (SOC 2 report, policies)
- [ ] Implement access controls (NDA, email gate)
- [ ] Create customizable branding

## Acceptance Criteria
- [ ] Trust portal is publicly accessible
- [ ] Documents can be shared securely
- [ ] Branding matches organization
"@
    },
    @{
        title = "[FEATURE] Audit Management Workflow"
        labels = "phase: 5-enterprise,type: feature,priority: high,component: backend,component: frontend"
        milestone = "v1.0.0 - Enterprise"
        body = @"
## Description
Implement comprehensive audit management features.

## Tasks
- [ ] Create audit project management
- [ ] Build auditor collaboration portal
- [ ] Implement evidence request workflow
- [ ] Create audit timeline tracking
- [ ] Add auditor communication log
- [ ] Build audit report generation

## Acceptance Criteria
- [ ] Audits can be managed end-to-end
- [ ] Auditors can access relevant data
- [ ] Communication is tracked
"@
    },
    @{
        title = "[FEATURE] Enterprise SSO"
        labels = "phase: 5-enterprise,type: feature,priority: high,component: auth"
        milestone = "v1.0.0 - Enterprise"
        body = @"
## Description
Implement enterprise SSO with SAML and OIDC support.

## Tasks
- [ ] Add SAML 2.0 support
- [ ] Add OIDC support
- [ ] Create SSO configuration UI
- [ ] Implement JIT user provisioning
- [ ] Add SCIM support for user sync
- [ ] Create SSO testing tools

## Acceptance Criteria
- [ ] SAML SSO works with major IdPs
- [ ] OIDC SSO works
- [ ] Users are provisioned automatically
"@
    },
    @{
        title = "[FEATURE] Advanced Reporting"
        labels = "phase: 5-enterprise,type: feature,priority: medium,component: frontend"
        milestone = "v1.0.0 - Enterprise"
        body = @"
## Description
Build advanced reporting and export capabilities.

## Tasks
- [ ] Create report builder UI
- [ ] Add scheduled report generation
- [ ] Implement multiple export formats (PDF, Excel, CSV)
- [ ] Build executive summary reports
- [ ] Create trend analysis reports
- [ ] Add custom report templates

## Acceptance Criteria
- [ ] Reports can be customized
- [ ] Reports can be scheduled
- [ ] Multiple export formats work
"@
    },
    @{
        title = "[FEATURE] Public API"
        labels = "phase: 5-enterprise,type: feature,priority: medium,component: backend"
        milestone = "v1.0.0 - Enterprise"
        body = @"
## Description
Create a public API for external integrations.

## Tasks
- [ ] Design RESTful API endpoints
- [ ] Implement API key authentication
- [ ] Create rate limiting
- [ ] Build API documentation
- [ ] Add webhook notifications
- [ ] Create SDK/client libraries

## Acceptance Criteria
- [ ] API is documented and versioned
- [ ] Authentication is secure
- [ ] Rate limits protect the system
"@
    },
    @{
        title = "[TASK] Performance and Scale"
        labels = "phase: 5-enterprise,type: task,priority: high,component: backend"
        milestone = "v1.0.0 - Enterprise"
        body = @"
## Description
Optimize the platform for enterprise scale.

## Tasks
- [ ] Implement database query optimization
- [ ] Add Redis caching layer
- [ ] Optimize file storage and retrieval
- [ ] Implement connection pooling
- [ ] Add horizontal scaling support
- [ ] Create performance monitoring

## Acceptance Criteria
- [ ] Response times under 200ms for common operations
- [ ] System handles 1000+ concurrent users
- [ ] No degradation under load
"@
    }
)

# Combine all issues
$allIssues = $phase1Issues + $phase2Issues + $phase3Issues + $phase4Issues + $phase5Issues

$totalIssues = $allIssues.Count
$currentIssue = 0

foreach ($issue in $allIssues) {
    $currentIssue++
    Write-Host "[$currentIssue/$totalIssues] Creating: $($issue.title)" -ForegroundColor Yellow
    
    # Create temp file for body
    $bodyFile = [System.IO.Path]::GetTempFileName()
    $issue.body | Out-File -FilePath $bodyFile -Encoding utf8
    
    # Create the issue
    gh issue create --title $issue.title --label $issue.labels --milestone $issue.milestone --body-file $bodyFile
    
    # Clean up temp file
    Remove-Item $bodyFile
    
    # Small delay to avoid rate limiting
    Start-Sleep -Milliseconds 500
}

Write-Host "`nAll $totalIssues issues created successfully!" -ForegroundColor Green
Write-Host "View them at: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/issues" -ForegroundColor Cyan
