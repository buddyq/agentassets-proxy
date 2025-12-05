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

interface SiteAnalytics {
  title: string;
  address: string;
  slug: string;
  customDomain: string | null;
  views: number;
  uniqueVisitors: number;
  leads: number;
  status: string;
}

interface AnalyticsEmailData {
  recipientEmail: string;
  recipientName: string;
  sites: SiteAnalytics[];
  monthName: string;
  year: number;
}

export async function sendMonthlyAnalyticsEmail(data: AnalyticsEmailData): Promise<void> {
  const { recipientEmail, recipientName, sites, monthName, year } = data;
  
  const safeName = escapeHtml(recipientName || 'there');
  
  const totalViews = sites.reduce((sum, site) => sum + site.views, 0);
  const totalVisitors = sites.reduce((sum, site) => sum + site.uniqueVisitors, 0);
  const totalLeads = sites.reduce((sum, site) => sum + site.leads, 0);
  const publishedSites = sites.filter(s => s.status === 'published').length;
  
  const siteRowsHtml = sites.length > 0 
    ? sites.map(site => {
        const siteUrl = site.customDomain 
          ? `https://${site.customDomain}` 
          : `https://agentassets.com/p/${site.slug}`;
        const safeSiteTitle = escapeHtml(site.title || site.address);
        const safeAddress = escapeHtml(site.address);
        
        return `
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${safeSiteTitle}</div>
              <div style="font-size: 13px; color: #6b7280;">${safeAddress}</div>
              <a href="${siteUrl}" style="font-size: 12px; color: #558B73; text-decoration: none;">${site.customDomain || `agentassets.com/p/${site.slug}`}</a>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: center;">
              <div style="font-size: 20px; font-weight: 700; color: #111827;">${site.views.toLocaleString()}</div>
              <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">Views</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: center;">
              <div style="font-size: 20px; font-weight: 700; color: #111827;">${site.uniqueVisitors.toLocaleString()}</div>
              <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">Visitors</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: center;">
              <div style="font-size: 20px; font-weight: 700; color: #558B73;">${site.leads.toLocaleString()}</div>
              <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">Leads</div>
            </td>
          </tr>
        `;
      }).join('')
    : `
      <tr>
        <td colspan="4" style="padding: 40px; text-align: center; color: #6b7280;">
          <div style="font-size: 16px; margin-bottom: 8px;">No property sites yet</div>
          <div style="font-size: 14px;">Create your first property site to start tracking analytics!</div>
        </td>
      </tr>
    `;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6; }
        .container { max-width: 640px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #558B73 0%, #3d6b57 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0 0 8px 0; font-size: 26px; font-weight: 600; }
        .header p { margin: 0; opacity: 0.9; font-size: 15px; }
        .stats-row { display: flex; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .stat-box { flex: 1; padding: 24px 16px; text-align: center; border-right: 1px solid #e5e7eb; }
        .stat-box:last-child { border-right: none; }
        .stat-value { font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 4px; }
        .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .content { padding: 30px; }
        .section-title { font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
        .sites-table { width: 100%; border-collapse: collapse; }
        .footer { text-align: center; padding: 30px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; color: #6b7280; font-size: 13px; }
        .cta { display: inline-block; background: #558B73; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Monthly Analytics Report</h1>
          <p>${monthName} ${year}</p>
        </div>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
          <tr>
            <td style="width: 25%; padding: 24px 16px; text-align: center; border-right: 1px solid #e5e7eb;">
              <div style="font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 4px;">${publishedSites}</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Active Sites</div>
            </td>
            <td style="width: 25%; padding: 24px 16px; text-align: center; border-right: 1px solid #e5e7eb;">
              <div style="font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 4px;">${totalViews.toLocaleString()}</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Total Views</div>
            </td>
            <td style="width: 25%; padding: 24px 16px; text-align: center; border-right: 1px solid #e5e7eb;">
              <div style="font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 4px;">${totalVisitors.toLocaleString()}</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Visitors</div>
            </td>
            <td style="width: 25%; padding: 24px 16px; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: #558B73; margin-bottom: 4px;">${totalLeads.toLocaleString()}</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Total Leads</div>
            </td>
          </tr>
        </table>
        
        <div class="content">
          <div style="margin-bottom: 8px;">
            <span style="font-size: 15px; color: #374151;">Hi ${safeName},</span>
          </div>
          <p style="color: #6b7280; margin-bottom: 24px; font-size: 15px;">
            Here's how your property sites performed this month. Keep up the great work!
          </p>
          
          <div class="section-title">Site Performance</div>
          <table class="sites-table">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">Property</th>
                <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">Views</th>
                <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">Visitors</th>
                <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">Leads</th>
              </tr>
            </thead>
            <tbody>
              ${siteRowsHtml}
            </tbody>
          </table>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://agentassets.com/dashboard" class="cta">View Full Dashboard</a>
          </div>
        </div>
        
        <div class="footer">
          <p>You're receiving this because you have property sites on AgentAssets.</p>
          <p style="margin-top: 8px;">Questions? Reply to this email or visit agentassets.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const sitesList = sites.length > 0
    ? sites.map(site => {
        const siteUrl = site.customDomain 
          ? `https://${site.customDomain}` 
          : `https://agentassets.com/p/${site.slug}`;
        return `
${site.title || site.address}
${site.address}
URL: ${siteUrl}
Views: ${site.views} | Visitors: ${site.uniqueVisitors} | Leads: ${site.leads}
`;
      }).join('\n---\n')
    : 'No property sites yet. Create your first property site to start tracking analytics!';

  const textContent = `
Your Monthly Analytics Report - ${monthName} ${year}

Hi ${recipientName || 'there'},

Here's how your property sites performed this month:

SUMMARY
-------
Active Sites: ${publishedSites}
Total Views: ${totalViews}
Total Visitors: ${totalVisitors}
Total Leads: ${totalLeads}

SITE PERFORMANCE
----------------
${sitesList}

View your full dashboard: https://agentassets.com/dashboard

---
You're receiving this because you have property sites on AgentAssets.
Questions? Reply to this email or visit agentassets.com
  `.trim();

  await transporter.sendMail({
    from: `"AgentAssets" <${process.env.SMTP_FROM || 'no-reply@agentassets.com'}>`,
    to: recipientEmail,
    subject: `Your ${monthName} Property Analytics Report`,
    text: textContent,
    html: htmlContent,
  });
  console.log(`Monthly analytics email sent to ${recipientEmail}`);
}
