import nodemailer from 'nodemailer';

const smtpPort = parseInt(process.env.SMTP_PORT || '465');
const isSecure = smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, char => htmlEntities[char] || char);
}

interface LeadEmailData {
  recipientEmail: string;
  recipientName: string;
  propertyAddress: string;
  propertyTitle: string;
  leadFirstName: string;
  leadLastName: string;
  leadEmail: string;
  leadPhone: string;
  leadMessage: string;
}

export async function sendLeadNotificationEmail(data: LeadEmailData): Promise<void> {
  const { 
    recipientEmail, 
    recipientName,
    propertyAddress, 
    propertyTitle,
    leadFirstName, 
    leadLastName, 
    leadEmail, 
    leadPhone, 
    leadMessage 
  } = data;

  const safePropertyTitle = escapeHtml(propertyTitle);
  const safePropertyAddress = escapeHtml(propertyAddress);
  const safeLeadFirstName = escapeHtml(leadFirstName);
  const safeLeadLastName = escapeHtml(leadLastName);
  const safeLeadEmail = escapeHtml(leadEmail);
  const safeLeadPhone = escapeHtml(leadPhone);
  const safeLeadMessage = escapeHtml(leadMessage);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #558B73 0%, #3d6b57 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
        .property-info { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #558B73; }
        .lead-info { background: white; padding: 20px; border-radius: 8px; }
        .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { font-size: 16px; margin-bottom: 15px; color: #333; }
        .message-box { background: #f5f5f5; padding: 15px; border-radius: 6px; margin-top: 10px; font-style: italic; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
        .cta { display: inline-block; background: #558B73; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Property Inquiry</h1>
        </div>
        <div class="content">
          <div class="property-info">
            <div class="label">Property</div>
            <div class="value" style="font-size: 18px; font-weight: 600;">${safePropertyTitle || safePropertyAddress}</div>
            <div class="label">Address</div>
            <div class="value">${safePropertyAddress}</div>
          </div>
          
          <div class="lead-info">
            <div class="label">Contact Name</div>
            <div class="value">${safeLeadFirstName} ${safeLeadLastName}</div>
            
            <div class="label">Email</div>
            <div class="value"><a href="mailto:${safeLeadEmail}" style="color: #558B73;">${safeLeadEmail}</a></div>
            
            <div class="label">Phone</div>
            <div class="value"><a href="tel:${safeLeadPhone}" style="color: #558B73;">${safeLeadPhone}</a></div>
            
            <div class="label">Message</div>
            <div class="message-box">${safeLeadMessage}</div>
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="mailto:${safeLeadEmail}?subject=Re: ${safePropertyAddress}" class="cta">Reply to ${safeLeadFirstName}</a>
          </div>
        </div>
        <div class="footer">
          <p>This notification was sent by AgentAssets</p>
          <p>You received this because someone inquired about your property listing.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
New Property Inquiry

Property: ${propertyTitle || propertyAddress}
Address: ${propertyAddress}

Contact Information:
Name: ${leadFirstName} ${leadLastName}
Email: ${leadEmail}
Phone: ${leadPhone}

Message:
${leadMessage}

---
This notification was sent by AgentAssets
  `.trim();

  await transporter.sendMail({
    from: `"AgentAssets" <${process.env.SMTP_FROM || 'no-reply@agentassets.com'}>`,
    to: recipientEmail,
    subject: `New Inquiry: ${propertyAddress}`,
    text: textContent,
    html: htmlContent,
  });
  console.log(`Lead notification email sent to ${recipientEmail}`);
}
