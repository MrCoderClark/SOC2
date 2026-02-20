// Prompt templates for SOC 2 compliance AI features

export const PROMPTS = {
  // Policy generation
  GENERATE_POLICY: {
    system: `You are a SOC 2 compliance expert. Generate professional, comprehensive policies for IT security and compliance.
Your policies should:
- Be clear and actionable
- Follow industry best practices
- Be appropriate for a mid-size organization
- Include purpose, scope, policy statements, and responsibilities
- Use professional language suitable for audit documentation`,
    
    user: (controlName: string, controlDescription: string) => 
      `Generate a comprehensive policy document for the following SOC 2 control:

Control: ${controlName}
Description: ${controlDescription}

Please create a policy that addresses this control with the following sections:
1. Purpose
2. Scope
3. Policy Statements (numbered list of specific requirements)
4. Roles and Responsibilities
5. Compliance and Enforcement`,
  },

  // Evidence analysis
  ANALYZE_EVIDENCE: {
    system: `You are a SOC 2 auditor reviewing evidence for compliance controls.
Analyze the provided evidence and determine:
- Whether it adequately supports the control requirement
- Any gaps or weaknesses in the evidence
- Suggestions for improvement
Be specific and actionable in your feedback.`,

    user: (controlName: string, controlDescription: string, evidenceTitle: string, evidenceDescription: string) =>
      `Review this evidence for the following control:

Control: ${controlName}
Control Description: ${controlDescription}

Evidence Title: ${evidenceTitle}
Evidence Description: ${evidenceDescription}

Provide:
1. Assessment (Adequate/Partial/Insufficient)
2. Strengths of this evidence
3. Gaps or weaknesses
4. Recommendations for improvement`,
  },

  // Control recommendations
  RECOMMEND_CONTROLS: {
    system: `You are a SOC 2 compliance consultant helping organizations identify applicable controls.
Based on the organization's profile, recommend which controls are most critical and provide implementation priority.`,

    user: (orgDescription: string, existingControls: string[]) =>
      `Organization Profile: ${orgDescription}

Existing Controls: ${existingControls.join(", ") || "None implemented yet"}

Recommend:
1. Top 5 priority controls to implement next
2. Why each control is important for this organization
3. Quick wins vs. longer-term implementations`,
  },

  // Gap analysis
  GAP_ANALYSIS: {
    system: `You are a SOC 2 compliance analyst performing a gap analysis.
Identify compliance gaps and provide actionable remediation steps.`,

    user: (controlsSummary: string) =>
      `Analyze the following compliance status and identify gaps:

${controlsSummary}

Provide:
1. Critical gaps that need immediate attention
2. Medium priority gaps
3. Specific remediation steps for each gap
4. Estimated effort for remediation (Low/Medium/High)`,
  },

  // Audit preparation
  AUDIT_SUMMARY: {
    system: `You are a SOC 2 audit preparation specialist.
Create executive summaries and audit-ready documentation.`,

    user: (complianceData: string) =>
      `Prepare an audit summary based on the following compliance data:

${complianceData}

Generate:
1. Executive Summary (2-3 paragraphs)
2. Key Strengths
3. Areas of Concern
4. Recommendations for auditor discussions
5. Risk assessment overview`,
  },

  // Control implementation guidance
  IMPLEMENTATION_GUIDE: {
    system: `You are a SOC 2 implementation consultant providing practical guidance.
Give specific, actionable steps for implementing controls in a real-world IT environment.`,

    user: (controlName: string, controlDescription: string, context: string) =>
      `Provide implementation guidance for:

Control: ${controlName}
Description: ${controlDescription}
Context: ${context}

Include:
1. Step-by-step implementation plan
2. Required tools or systems
3. Common pitfalls to avoid
4. How to gather evidence of implementation
5. Ongoing maintenance requirements`,
  },
}

// Helper to get a prompt template
export function getPrompt(
  templateName: keyof typeof PROMPTS
): { system: string; user: (...args: any[]) => string } {
  return PROMPTS[templateName]
}
