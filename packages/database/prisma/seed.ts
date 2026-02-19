import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const soc2Controls = [
  // CC1 - Control Environment
  { code: "CC1.1", name: "COSO Principle 1", description: "The entity demonstrates a commitment to integrity and ethical values.", category: "SECURITY" },
  { code: "CC1.2", name: "COSO Principle 2", description: "The board of directors demonstrates independence from management and exercises oversight.", category: "SECURITY" },
  { code: "CC1.3", name: "COSO Principle 3", description: "Management establishes structures, reporting lines, and authorities.", category: "SECURITY" },
  { code: "CC1.4", name: "COSO Principle 4", description: "The entity demonstrates a commitment to attract, develop, and retain competent individuals.", category: "SECURITY" },
  { code: "CC1.5", name: "COSO Principle 5", description: "The entity holds individuals accountable for their internal control responsibilities.", category: "SECURITY" },
  
  // CC2 - Communication and Information
  { code: "CC2.1", name: "COSO Principle 13", description: "The entity obtains or generates and uses relevant, quality information.", category: "SECURITY" },
  { code: "CC2.2", name: "COSO Principle 14", description: "The entity internally communicates information necessary to support internal control.", category: "SECURITY" },
  { code: "CC2.3", name: "COSO Principle 15", description: "The entity communicates with external parties regarding internal control matters.", category: "SECURITY" },
  
  // CC3 - Risk Assessment
  { code: "CC3.1", name: "COSO Principle 6", description: "The entity specifies objectives with sufficient clarity to enable identification of risks.", category: "SECURITY" },
  { code: "CC3.2", name: "COSO Principle 7", description: "The entity identifies risks and analyzes how risks should be managed.", category: "SECURITY" },
  { code: "CC3.3", name: "COSO Principle 8", description: "The entity considers the potential for fraud in assessing risks.", category: "SECURITY" },
  { code: "CC3.4", name: "COSO Principle 9", description: "The entity identifies and assesses changes that could significantly impact internal control.", category: "SECURITY" },
  
  // CC4 - Monitoring Activities
  { code: "CC4.1", name: "COSO Principle 16", description: "The entity selects and develops ongoing and/or separate evaluations.", category: "SECURITY" },
  { code: "CC4.2", name: "COSO Principle 17", description: "The entity evaluates and communicates internal control deficiencies.", category: "SECURITY" },
  
  // CC5 - Control Activities
  { code: "CC5.1", name: "COSO Principle 10", description: "The entity selects and develops control activities that mitigate risks.", category: "SECURITY" },
  { code: "CC5.2", name: "COSO Principle 11", description: "The entity selects and develops general control activities over technology.", category: "SECURITY" },
  { code: "CC5.3", name: "COSO Principle 12", description: "The entity deploys control activities through policies and procedures.", category: "SECURITY" },
  
  // CC6 - Logical and Physical Access Controls
  { code: "CC6.1", name: "Logical Access Security", description: "The entity implements logical access security software and infrastructure.", category: "SECURITY" },
  { code: "CC6.2", name: "User Registration", description: "Prior to issuing credentials, the entity registers and authorizes new users.", category: "SECURITY" },
  { code: "CC6.3", name: "Access Removal", description: "The entity removes access to protected information when appropriate.", category: "SECURITY" },
  { code: "CC6.4", name: "Access Review", description: "The entity restricts physical access to facilities and protected information.", category: "SECURITY" },
  { code: "CC6.5", name: "Logical Access Disposal", description: "The entity discontinues logical and physical protections over assets only after disposal.", category: "SECURITY" },
  { code: "CC6.6", name: "External Threats", description: "The entity implements controls to prevent or detect and act upon threats.", category: "SECURITY" },
  { code: "CC6.7", name: "Transmission Protection", description: "The entity restricts the transmission of data to authorized channels.", category: "SECURITY" },
  { code: "CC6.8", name: "Malicious Software", description: "The entity implements controls to prevent or detect malicious software.", category: "SECURITY" },
  
  // CC7 - System Operations
  { code: "CC7.1", name: "Vulnerability Detection", description: "The entity uses detection and monitoring procedures to identify changes.", category: "SECURITY" },
  { code: "CC7.2", name: "Incident Monitoring", description: "The entity monitors system components for anomalies and security events.", category: "SECURITY" },
  { code: "CC7.3", name: "Incident Response", description: "The entity evaluates security events to determine whether they are incidents.", category: "SECURITY" },
  { code: "CC7.4", name: "Incident Recovery", description: "The entity responds to identified security incidents by executing response procedures.", category: "SECURITY" },
  { code: "CC7.5", name: "Recovery Testing", description: "The entity identifies, develops, and implements activities to recover from incidents.", category: "SECURITY" },
  
  // CC8 - Change Management
  { code: "CC8.1", name: "Change Management", description: "The entity authorizes, designs, develops, configures, documents, tests, approves changes.", category: "SECURITY" },
  
  // CC9 - Risk Mitigation
  { code: "CC9.1", name: "Risk Mitigation", description: "The entity identifies, selects, and develops risk mitigation activities.", category: "SECURITY" },
  { code: "CC9.2", name: "Vendor Risk Management", description: "The entity assesses and manages risks associated with vendors and partners.", category: "SECURITY" },
  
  // Availability
  { code: "A1.1", name: "Capacity Planning", description: "The entity maintains, monitors, and evaluates current processing capacity.", category: "AVAILABILITY" },
  { code: "A1.2", name: "Environmental Protections", description: "The entity authorizes, designs, develops, and implements environmental protections.", category: "AVAILABILITY" },
  { code: "A1.3", name: "Recovery Procedures", description: "The entity tests recovery plan procedures supporting system recovery.", category: "AVAILABILITY" },
  
  // Confidentiality
  { code: "C1.1", name: "Confidential Information", description: "The entity identifies and maintains confidential information.", category: "CONFIDENTIALITY" },
  { code: "C1.2", name: "Confidential Disposal", description: "The entity disposes of confidential information to meet objectives.", category: "CONFIDENTIALITY" },
  
  // Processing Integrity
  { code: "PI1.1", name: "Processing Accuracy", description: "The entity implements policies for accurate and timely processing.", category: "PROCESSING_INTEGRITY" },
  { code: "PI1.2", name: "Input Validation", description: "The entity implements policies for complete and accurate input.", category: "PROCESSING_INTEGRITY" },
  { code: "PI1.3", name: "Processing Validation", description: "The entity implements policies for complete and accurate processing.", category: "PROCESSING_INTEGRITY" },
  { code: "PI1.4", name: "Output Validation", description: "The entity implements policies for complete and accurate output.", category: "PROCESSING_INTEGRITY" },
  { code: "PI1.5", name: "Data Retention", description: "The entity implements policies for storage and retention of data.", category: "PROCESSING_INTEGRITY" },
  
  // Privacy
  { code: "P1.1", name: "Privacy Notice", description: "The entity provides notice about its privacy practices.", category: "PRIVACY" },
  { code: "P2.1", name: "Privacy Choice", description: "The entity communicates choices available regarding data collection.", category: "PRIVACY" },
  { code: "P3.1", name: "Privacy Collection", description: "The entity collects personal information consistent with objectives.", category: "PRIVACY" },
  { code: "P4.1", name: "Privacy Use", description: "The entity limits the use of personal information to stated purposes.", category: "PRIVACY" },
  { code: "P5.1", name: "Privacy Retention", description: "The entity retains personal information consistent with objectives.", category: "PRIVACY" },
  { code: "P6.1", name: "Privacy Disposal", description: "The entity securely disposes of personal information.", category: "PRIVACY" },
  { code: "P7.1", name: "Privacy Quality", description: "The entity collects and maintains accurate personal information.", category: "PRIVACY" },
  { code: "P8.1", name: "Privacy Monitoring", description: "The entity monitors compliance with its privacy commitments.", category: "PRIVACY" },
]

async function main() {
  console.log("Seeding SOC 2 controls...")
  
  for (const control of soc2Controls) {
    await prisma.control.upsert({
      where: {
        organizationId_code: {
          organizationId: "default",
          code: control.code,
        },
      },
      update: {},
      create: {
        code: control.code,
        name: control.name,
        description: control.description,
        category: control.category as any,
        organization: {
          connectOrCreate: {
            where: { slug: "default" },
            create: {
              name: "Default Organization",
              slug: "default",
            },
          },
        },
      },
    })
  }
  
  console.log(`Seeded ${soc2Controls.length} SOC 2 controls`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
