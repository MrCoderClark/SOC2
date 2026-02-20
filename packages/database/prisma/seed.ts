import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const soc2Controls = [
  // ============================================
  // IDENTITY & ACCESS MANAGEMENT (Your daily work!)
  // ============================================
  
  // Active Directory Controls
  { code: "IAM-AD-01", name: "AD User Provisioning", description: "New user accounts in Active Directory are created only with documented approval (ticket/email from HR or manager).", category: "SECURITY" },
  { code: "IAM-AD-02", name: "AD User Deprovisioning", description: "User accounts are disabled within 24 hours of termination notification. Evidence: termination ticket + AD disabled timestamp.", category: "SECURITY" },
  { code: "IAM-AD-03", name: "AD Access Review", description: "Quarterly review of Active Directory user accounts and group memberships. Remove stale/orphaned accounts.", category: "SECURITY" },
  { code: "IAM-AD-04", name: "AD Password Policy", description: "AD password policy enforces minimum 12 characters, complexity, 90-day expiration, and lockout after 5 failed attempts.", category: "SECURITY" },
  { code: "IAM-AD-05", name: "AD Privileged Access", description: "Domain Admin and other privileged group memberships are reviewed monthly and require documented justification.", category: "SECURITY" },
  
  // Microsoft 365 Controls
  { code: "IAM-O365-01", name: "O365 User Provisioning", description: "O365 accounts are created with appropriate license assignment based on role. Evidence: provisioning ticket + license assignment.", category: "SECURITY" },
  { code: "IAM-O365-02", name: "O365 User Deprovisioning", description: "O365 accounts are disabled and licenses reclaimed within 24 hours of termination.", category: "SECURITY" },
  { code: "IAM-O365-03", name: "O365 MFA Enforcement", description: "Multi-factor authentication is required for all O365 users. Evidence: Conditional Access policy screenshot.", category: "SECURITY" },
  { code: "IAM-O365-04", name: "O365 Admin Access Review", description: "Global Admin and other privileged O365 roles are reviewed quarterly.", category: "SECURITY" },
  { code: "IAM-O365-05", name: "O365 External Sharing", description: "SharePoint/OneDrive external sharing settings are configured to organization policy. Evidence: sharing settings screenshot.", category: "CONFIDENTIALITY" },
  
  // Salesforce Controls
  { code: "IAM-SF-01", name: "Salesforce User Provisioning", description: "Salesforce users are created with appropriate profile/permission set based on role. Evidence: user creation ticket.", category: "SECURITY" },
  { code: "IAM-SF-02", name: "Salesforce User Deprovisioning", description: "Salesforce users are deactivated within 24 hours of termination. License is freed for reuse.", category: "SECURITY" },
  { code: "IAM-SF-03", name: "Salesforce Access Review", description: "Quarterly review of Salesforce users, profiles, and permission sets. Remove unnecessary access.", category: "SECURITY" },
  { code: "IAM-SF-04", name: "Salesforce SSO/MFA", description: "Salesforce login requires SSO through identity provider or MFA is enabled.", category: "SECURITY" },
  { code: "IAM-SF-05", name: "Salesforce Admin Access", description: "System Administrator profile assignments are reviewed monthly and require documented justification.", category: "SECURITY" },
  
  // Intermedia Unite Controls
  { code: "IAM-IM-01", name: "Intermedia User Provisioning", description: "New Intermedia Unite accounts are created with appropriate license and phone number assignment.", category: "SECURITY" },
  { code: "IAM-IM-02", name: "Intermedia User Deprovisioning", description: "Intermedia accounts are disabled and licenses/phone numbers reclaimed upon termination.", category: "SECURITY" },
  { code: "IAM-IM-03", name: "Intermedia License Management", description: "Monthly review of Intermedia licenses to ensure no unused licenses are being billed.", category: "AVAILABILITY" },
  
  // ============================================
  // GENERAL ACCESS CONTROLS
  // ============================================
  { code: "AC-01", name: "Access Request Process", description: "All access requests require documented approval before provisioning. Evidence: ticket system logs.", category: "SECURITY" },
  { code: "AC-02", name: "Least Privilege Principle", description: "Users are granted minimum access necessary for their job function.", category: "SECURITY" },
  { code: "AC-03", name: "Separation of Duties", description: "Critical functions require multiple people (e.g., request vs. approval).", category: "SECURITY" },
  { code: "AC-04", name: "Unique User IDs", description: "Each user has a unique identifier. No shared accounts for individual use.", category: "SECURITY" },
  { code: "AC-05", name: "Terminated User Access", description: "All system access is revoked within 24 hours of employee termination.", category: "SECURITY" },
  
  // ============================================
  // CHANGE MANAGEMENT
  // ============================================
  { code: "CM-01", name: "Change Request Documentation", description: "All system changes are documented in a ticket before implementation.", category: "SECURITY" },
  { code: "CM-02", name: "Change Approval", description: "Changes require approval from appropriate authority before implementation.", category: "SECURITY" },
  { code: "CM-03", name: "Change Testing", description: "Changes are tested in non-production environment when possible.", category: "SECURITY" },
  { code: "CM-04", name: "Emergency Changes", description: "Emergency changes are documented and approved retroactively within 24 hours.", category: "SECURITY" },
  
  // ============================================
  // INCIDENT MANAGEMENT
  // ============================================
  { code: "IR-01", name: "Incident Reporting", description: "Security incidents are reported and logged in ticket system.", category: "SECURITY" },
  { code: "IR-02", name: "Incident Response", description: "Incidents are triaged and responded to based on severity.", category: "SECURITY" },
  { code: "IR-03", name: "Incident Resolution", description: "Incidents are resolved and root cause documented.", category: "SECURITY" },
  
  // ============================================
  // SYSTEM MONITORING
  // ============================================
  { code: "MON-01", name: "Login Monitoring", description: "Failed login attempts are monitored and investigated. Evidence: security logs.", category: "SECURITY" },
  { code: "MON-02", name: "Admin Activity Logging", description: "Administrative actions are logged and retained. Evidence: audit logs.", category: "SECURITY" },
  { code: "MON-03", name: "License Utilization", description: "Software license usage is monitored to ensure compliance and cost optimization.", category: "AVAILABILITY" },
  
  // ============================================
  // DATA PROTECTION
  // ============================================
  { code: "DP-01", name: "Data Classification", description: "Data is classified based on sensitivity (Public, Internal, Confidential, Restricted).", category: "CONFIDENTIALITY" },
  { code: "DP-02", name: "Data Encryption", description: "Sensitive data is encrypted at rest and in transit.", category: "CONFIDENTIALITY" },
  { code: "DP-03", name: "Data Backup", description: "Critical data is backed up regularly and backups are tested.", category: "AVAILABILITY" },
  { code: "DP-04", name: "Data Retention", description: "Data is retained according to retention policy and securely disposed when no longer needed.", category: "CONFIDENTIALITY" },
  
  // ============================================
  // VENDOR MANAGEMENT
  // ============================================
  { code: "VM-01", name: "Vendor Security Assessment", description: "Third-party vendors handling sensitive data are assessed for security practices.", category: "SECURITY" },
  { code: "VM-02", name: "Vendor Access Review", description: "Vendor/contractor access is reviewed quarterly and removed when no longer needed.", category: "SECURITY" },
  
  // ============================================
  // BUSINESS CONTINUITY
  // ============================================
  { code: "BC-01", name: "System Documentation", description: "Critical systems are documented including configuration and recovery procedures.", category: "AVAILABILITY" },
  { code: "BC-02", name: "Backup Verification", description: "Backups are tested quarterly to ensure recoverability.", category: "AVAILABILITY" },
  { code: "BC-03", name: "Disaster Recovery Plan", description: "DR plan exists and is tested annually.", category: "AVAILABILITY" },
  
  // ============================================
  // COMPLIANCE & AUDIT
  // ============================================
  { code: "AUD-01", name: "Access Certification", description: "Quarterly user access review completed and documented for all critical systems.", category: "SECURITY" },
  { code: "AUD-02", name: "Policy Acknowledgment", description: "Users acknowledge security policies annually.", category: "SECURITY" },
  { code: "AUD-03", name: "Audit Log Retention", description: "Audit logs are retained for minimum 1 year.", category: "SECURITY" },
]

async function main() {
  console.log("Seeding SOC 2 controls...")
  
  // Clean up old controls first to avoid duplicates
  const deleteResult = await prisma.control.deleteMany({})
  console.log(`Deleted ${deleteResult.count} existing controls`)
  
  // Get all organizations
  const organizations = await prisma.organization.findMany()
  
  if (organizations.length === 0) {
    console.log("No organizations found. Please create an organization first.")
    return
  }
  
  for (const org of organizations) {
    console.log(`Seeding controls for organization: ${org.name}`)
    
    for (const control of soc2Controls) {
      await prisma.control.upsert({
        where: {
          organizationId_code: {
            organizationId: org.id,
            code: control.code,
          },
        },
        update: {
          name: control.name,
          description: control.description,
          category: control.category as any,
        },
        create: {
          code: control.code,
          name: control.name,
          description: control.description,
          category: control.category as any,
          organizationId: org.id,
        },
      })
    }
    
    console.log(`Seeded ${soc2Controls.length} controls for ${org.name}`)
  }
  
  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
