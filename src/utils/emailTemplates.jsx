export const getMagicLinkEmailTemplate = (approvalTitle, projectName, magicLink, clientName = '') => {
  return `
Hi ${clientName || 'there'},

You've been asked to review an approval item:

📋 **Approval Title:** ${approvalTitle}
🏢 **Project:** ${projectName}

🔗 **Review Link:** ${magicLink}

This link will expire in 7 days. No login required - just click the link above to review and provide your feedback.

Best regards,
The Project Team

---
This is an automated message from Decidely Approval System
  `.trim();
};

export const getDecisionNotificationEmail = (approvalTitle, projectName, clientEmail, decision, comment = '') => {
  return `
A client has submitted a decision:

📋 **Approval:** ${approvalTitle}
🏢 **Project:** ${projectName}
👤 **Client:** ${clientEmail}
✅ **Decision:** ${decision}
💬 **Comment:** ${comment || 'No comment provided'}

View the updated approval in your dashboard.

---
This is an automated notification from Decidely
  `.trim();
};