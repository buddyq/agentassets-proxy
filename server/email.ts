import nodemailer from "nodemailer";

const smtpPort = parseInt(process.env.SMTP_PORT || "465");
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
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
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

export async function sendLeadNotificationEmail(
  data: LeadEmailData,
): Promise<void> {
  const {
    recipientEmail,
    recipientName,
    propertyAddress,
    propertyTitle,
    leadFirstName,
    leadLastName,
    leadEmail,
    leadPhone,
    leadMessage,
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
    from: `"AgentAssets" <${process.env.SMTP_FROM || "no-reply@agentassets.com"}>`,
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

export async function sendMonthlyAnalyticsEmail(
  data: AnalyticsEmailData,
): Promise<void> {
  const { recipientEmail, recipientName, sites, monthName, year } = data;

  const safeName = escapeHtml(recipientName || "there");

  const totalViews = sites.reduce((sum, site) => sum + site.views, 0);
  const totalVisitors = sites.reduce(
    (sum, site) => sum + site.uniqueVisitors,
    0,
  );
  const totalLeads = sites.reduce((sum, site) => sum + site.leads, 0);
  const publishedSites = sites.filter((s) => s.status === "published").length;

  const siteCardsHtml =
    sites.length > 0
      ? sites
          .map((site) => {
            const siteUrl = site.customDomain
              ? `https://${site.customDomain}`
              : `https://agentassets.com/p/${site.slug}`;
            const safeSiteTitle = escapeHtml(site.title || site.address);
            const safeAddress = escapeHtml(site.address);
            const statusColor =
              site.status === "published" ? "#558B73" : "#9ca3af";
            const statusBg =
              site.status === "published" ? "#ecfdf5" : "#f3f4f6";
            const statusText =
              site.status === "published" ? "Published" : "Draft";

            return `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
            <tr>
              <td style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <!-- Property Header -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                  <tr>
                    <td>
                      <div style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 4px; font-family: 'Helvetica Neue', Arial, sans-serif;">${safeSiteTitle}</div>
                      <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">${safeAddress}</div>
                      <span style="display: inline-block; background: ${statusBg}; color: ${statusColor}; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">${statusText}</span>
                    </td>
                  </tr>
                </table>
                
                <!-- Metrics Row -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 8px; margin-bottom: 16px;">
                  <tr>
                    <td style="width: 33.33%; padding: 16px; text-align: center; border-right: 1px solid #e5e7eb;">
                      <div style="font-size: 28px; font-weight: 700; color: #374151; margin-bottom: 2px;">${site.views.toLocaleString()}</div>
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Page Views</div>
                    </td>
                    <td style="width: 33.33%; padding: 16px; text-align: center; border-right: 1px solid #e5e7eb;">
                      <div style="font-size: 28px; font-weight: 700; color: #3d6b57; margin-bottom: 2px;">${site.uniqueVisitors.toLocaleString()}</div>
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Unique Visitors</div>
                    </td>
                    <td style="width: 33.33%; padding: 16px; text-align: center;">
                      <div style="font-size: 28px; font-weight: 700; color: #b8860b; margin-bottom: 2px;">${site.leads.toLocaleString()}</div>
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Leads</div>
                    </td>
                  </tr>
                </table>
                
                <!-- View Site Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="text-align: center;">
                      <a href="${siteUrl}" style="display: inline-block; background: transparent; color: #558B73; font-size: 14px; font-weight: 600; padding: 10px 20px; text-decoration: none; border: 2px solid #558B73; border-radius: 8px;">View Site →</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `;
          })
          .join("")
      : `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
        <tr>
          <td style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 48px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🏠</div>
            <div style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 8px;">No Property Sites Yet</div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">Create your first property site to start tracking analytics!</div>
            <a href="https://agentassets.com/create" style="display: inline-block; background: #558B73; color: white; font-size: 14px; font-weight: 600; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Create Your First Site</a>
          </td>
        </tr>
      </table>
    `;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              
              <!-- Logo Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2d4a3e 0%, #1a2e26 100%); padding: 32px 40px; text-align: center;">
                  <img src="https://agentassets.com/logo-white.png" alt="AgentAssets" style="height: 36px; margin-bottom: 0;" onerror="this.style.display='none'"/>
                  <div style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; font-family: 'Helvetica Neue', Arial, sans-serif;">AgentAssets</div>
                </td>
              </tr>
              
              <!-- Report Title -->
              <tr>
                <td style="background: linear-gradient(135deg, #558B73 0%, #3d6b57 100%); padding: 40px; text-align: center;">
                  <div style="color: rgba(255,255,255,0.8); font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Monthly Analytics Report</div>
                  <div style="color: #ffffff; font-size: 32px; font-weight: 700; font-family: 'Helvetica Neue', Arial, sans-serif;">${monthName} ${year}</div>
                </td>
              </tr>
              
              <!-- Summary Stats -->
              <tr>
                <td style="padding: 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #e5e7eb;">
                    <tr>
                      <td style="width: 25%; padding: 28px 16px; text-align: center; border-right: 1px solid #e5e7eb; background: #fafafa;">
                        <div style="font-size: 36px; font-weight: 800; color: #111827; margin-bottom: 4px; font-family: 'Helvetica Neue', Arial, sans-serif;">${publishedSites}</div>
                        <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Active Sites</div>
                      </td>
                      <td style="width: 25%; padding: 28px 16px; text-align: center; border-right: 1px solid #e5e7eb; background: #fafafa;">
                        <div style="font-size: 36px; font-weight: 800; color: #111827; margin-bottom: 4px; font-family: 'Helvetica Neue', Arial, sans-serif;">${totalViews.toLocaleString()}</div>
                        <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Total Views</div>
                      </td>
                      <td style="width: 25%; padding: 28px 16px; text-align: center; border-right: 1px solid #e5e7eb; background: #fafafa;">
                        <div style="font-size: 36px; font-weight: 800; color: #3d6b57; margin-bottom: 4px; font-family: 'Helvetica Neue', Arial, sans-serif;">${totalVisitors.toLocaleString()}</div>
                        <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Visitors</div>
                      </td>
                      <td style="width: 25%; padding: 28px 16px; text-align: center; background: #fafafa;">
                        <div style="font-size: 36px; font-weight: 800; color: #b8860b; margin-bottom: 4px; font-family: 'Helvetica Neue', Arial, sans-serif;">${totalLeads.toLocaleString()}</div>
                        <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Total Leads</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Greeting & Sites -->
              <tr>
                <td style="padding: 40px;">
                  <div style="margin-bottom: 24px;">
                    <div style="font-size: 18px; color: #111827; font-weight: 600; margin-bottom: 8px;">Hi ${safeName} 👋</div>
                    <div style="font-size: 15px; color: #6b7280; line-height: 1.6;">Here's how your property sites performed this month. ${totalLeads > 0 ? `Great job generating ${totalLeads} lead${totalLeads > 1 ? "s" : ""}!` : "Keep up the great work!"}</div>
                  </div>
                  
                  <!-- Section Title -->
                  <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <div style="font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 1px;">Your Property Sites</div>
                    <div style="flex: 1; height: 1px; background: #e5e7eb; margin-left: 16px;"></div>
                  </div>
                  
                  <!-- Site Cards -->
                  ${siteCardsHtml}
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="https://agentassets.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #558B73 0%, #3d6b57 100%); color: #ffffff; font-size: 16px; font-weight: 600; padding: 16px 40px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px rgba(85,139,115,0.4);">View Full Dashboard</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <div style="margin-bottom: 16px;">
                    <span style="color: #558B73; font-size: 20px; font-weight: 700; font-family: 'Helvetica Neue', Arial, sans-serif;">AgentAssets</span>
                  </div>
                  <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">Beautiful property websites for real estate professionals</div>
                  <div style="font-size: 12px; color: #9ca3af;">
                    You're receiving this because you have property sites on AgentAssets.<br/>
                    Questions? Reply to this email or visit <a href="https://agentassets.com" style="color: #558B73; text-decoration: none;">agentassets.com</a>
                  </div>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const sitesList =
    sites.length > 0
      ? sites
          .map((site) => {
            const siteUrl = site.customDomain
              ? `https://${site.customDomain}`
              : `https://agentassets.com/p/${site.slug}`;
            return `
${site.title || site.address}
${site.address}
URL: ${siteUrl}
Views: ${site.views} | Visitors: ${site.uniqueVisitors} | Leads: ${site.leads}
`;
          })
          .join("\n---\n")
      : "No property sites yet. Create your first property site to start tracking analytics!";

  const textContent = `
Your Monthly Analytics Report - ${monthName} ${year}

Hi ${recipientName || "there"},

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
    from: `"AgentAssets" <${process.env.SMTP_FROM || "no-reply@agentassets.com"}>`,
    to: recipientEmail,
    subject: `Your ${monthName} Property Analytics Report`,
    text: textContent,
    html: htmlContent,
  });
  console.log(`Monthly analytics email sent to ${recipientEmail}`);
}

interface AgentInvitationEmailData {
  recipientEmail: string;
  recipientName: string;
  brokerageName: string;
  inviterName: string;
  setupToken: string;
  baseUrl: string;
}

export async function sendAgentInvitationEmail(
  data: AgentInvitationEmailData,
): Promise<void> {
  const {
    recipientEmail,
    recipientName,
    brokerageName,
    inviterName,
    setupToken,
    baseUrl,
  } = data;

  const safeRecipientName = escapeHtml(recipientName || "there");
  const safeBrokerageName = escapeHtml(brokerageName);
  const setupUrl = `${baseUrl}/setup-password?token=${setupToken}`;
  const logoUrl =
    "https://atxpocket.nyc3.cdn.digitaloceanspaces.com/static/img/logos/agentassets_logo_white.png";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f7f5; }
        .wrapper { padding: 40px 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(13, 148, 136, 0.12); }
        .header { background: #0d9488; padding: 32px 40px; text-align: center; }
        .header img { max-width: 200px; height: auto; }
        .content { padding: 40px; }
        .welcome-box { background: linear-gradient(135deg, #f0fdfa 0%, #e6f7f5 100%); border-radius: 12px; padding: 24px; margin-bottom: 32px; border-left: 4px solid #0d9488; }
        .welcome-box h2 { margin: 0 0 8px; font-size: 20px; color: #333; }
        .welcome-box p { margin: 0; color: #666; }
        .features { margin: 32px 0; }
        .cta-section { text-align: center; margin: 40px 0 24px; }
        .cta { display: inline-block; background: #0d9488; color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); }
        .expire-note { text-align: center; font-size: 13px; color: #888; margin-top: 16px; }
        .footer { background: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; font-size: 13px; color: #888; }
        .footer a { color: #0d9488; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="AgentAssets" />
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2>Hi ${safeRecipientName},</h2>
              <p style="font-size: 18px; font-weight: 500;">You've been invited to join the ${safeBrokerageName} team on AgentAssets!</p>
              <p style="margin-top: 8px;">Create stunning property websites in minutes.</p>
            </div>
            
            <div class="features">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 40px; height: 40px; background: #f0fdfa; border-radius: 10px; text-align: center; vertical-align: middle; color: #0d9488; font-size: 18px;">🏠</td>
                        <td style="padding-left: 16px;">
                          <div style="font-weight: 600; color: #333; margin-bottom: 4px;">Beautiful Property Websites</div>
                          <div style="font-size: 14px; color: #666;">Create professional single-property sites with premium templates</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 40px; height: 40px; background: #f0fdfa; border-radius: 10px; text-align: center; vertical-align: middle; color: #0d9488; font-size: 18px;">📊</td>
                        <td style="padding-left: 16px;">
                          <div style="font-weight: 600; color: #333; margin-bottom: 4px;">Real-Time Analytics</div>
                          <div style="font-size: 14px; color: #666;">Track visitors, page views, and lead inquiries</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 40px; height: 40px; background: #f0fdfa; border-radius: 10px; text-align: center; vertical-align: middle; color: #0d9488; font-size: 18px;">✨</td>
                        <td style="padding-left: 16px;">
                          <div style="font-weight: 600; color: #333; margin-bottom: 4px;">Your Brokerage's Brand</div>
                          <div style="font-size: 14px; color: #666;">Access exclusive templates customized for ${safeBrokerageName}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>
            
            <div class="cta-section">
              <a href="${setupUrl}" style="display: inline-block; background: #0d9488; color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">Set Up Your Account</a>
              <p class="expire-note">This link expires in 72 hours</p>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Contact your brokerage administrator or visit <a href="https://agentassets.com">agentassets.com</a></p>
            <p style="margin-top: 8px;">AgentAssets - Beautiful Property Websites for Real Estate Professionals</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hi ${recipientName || "there"},

You've been invited to join the ${brokerageName} team on AgentAssets!

AgentAssets helps you create stunning single-property websites for your listings with:
- Beautiful, customizable property templates
- Real-time analytics and visitor tracking  
- Lead capture forms to grow your business
- Exclusive brokerage-branded templates

Set up your account here (link expires in 72 hours):
${setupUrl}

Questions? Contact your brokerage administrator or visit agentassets.com

---
AgentAssets - Beautiful Property Websites for Real Estate Professionals
  `.trim();

  await transporter.sendMail({
    from: `"AgentAssets" <${process.env.SMTP_FROM || "no-reply@agentassets.com"}>`,
    to: recipientEmail,
    subject: `You're invited to join ${brokerageName} on AgentAssets`,
    text: textContent,
    html: htmlContent,
  });
  console.log(`Agent invitation email sent to ${recipientEmail}`);
}

interface GroupMemberAddedEmailData {
  recipientEmail: string;
  recipientName: string;
  groupName: string;
  adderName: string;
}

export async function sendGroupMemberAddedEmail(
  data: GroupMemberAddedEmailData,
): Promise<void> {
  const { recipientEmail, recipientName, groupName, adderName } = data;

  const safeRecipientName = escapeHtml(recipientName || "there");
  const safeGroupName = escapeHtml(groupName);
  const safeAdderName = escapeHtml(adderName);
  const logoUrl =
    "https://atxpocket.nyc3.cdn.digitaloceanspaces.com/static/img/logos/agentassets_logo_white.png";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f7f5; }
        .wrapper { padding: 40px 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(13, 148, 136, 0.12); }
        .header { background: #0d9488; padding: 32px 40px; text-align: center; }
        .header img { max-width: 200px; height: auto; }
        .content { padding: 40px; }
        .welcome-box { background: linear-gradient(135deg, #f0fdfa 0%, #e6f7f5 100%); border-radius: 12px; padding: 24px; margin-bottom: 32px; border-left: 4px solid #0d9488; }
        .welcome-box h2 { margin: 0 0 8px; font-size: 20px; color: #333; }
        .welcome-box p { margin: 0; color: #666; }
        .footer { background: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; font-size: 13px; color: #888; }
        .footer a { color: #0d9488; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="AgentAssets" />
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2>Hi ${safeRecipientName},</h2>
              <p style="font-size: 18px; font-weight: 500;">You have been added to the group "${safeGroupName}" by ${safeAdderName}.</p>
              <p style="margin-top: 8px;">You now have access to exclusive templates and themes for this group.</p>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
              <a href="https://agentassets.com/dashboard" style="display: inline-block; background: #0d9488; color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Contact your team lead or visit <a href="https://agentassets.com">agentassets.com</a></p>
            <p style="margin-top: 8px;">AgentAssets - Beautiful Property Websites for Real Estate Professionals</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hi ${recipientName || "there"},

You have been added to ${groupName} by ${adderName}.

You now have access to exclusive templates and resources for this team.

Visit your dashboard: https://agentassets.com/dashboard

---
AgentAssets - Beautiful Property Websites for Real Estate Professionals
  `.trim();

  await transporter.sendMail({
    from: `"AgentAssets" <${process.env.SMTP_FROM || "no-reply@agentassets.com"}>`,
    to: recipientEmail,
    subject: `You've been added to ${groupName}`,
    text: textContent,
    html: htmlContent,
  });
  console.log(`Group member added email sent to ${recipientEmail}`);
}

interface NewUserEmailData {
  userName: string;
  userEmail: string;
  createdAt: Date;
}

export async function sendNewUserNotificationEmail(data: NewUserEmailData): Promise<void> {
  const adminEmail = "buddy@agentassets.com";
  const { userName, userEmail, createdAt } = data;

  const safeUserName = escapeHtml(userName);
  const safeUserEmail = escapeHtml(userEmail);
  const formattedDate = createdAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const logoUrl = "https://atxpocket.nyc3.cdn.digitaloceanspaces.com/static/img/logos/agentassets_logo_white.png";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f7f5; }
        .wrapper { padding: 40px 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(85, 139, 115, 0.15); }
        .header { background: linear-gradient(135deg, #558B73 0%, #3d6b57 100%); padding: 32px 40px; text-align: center; }
        .header img { max-width: 200px; height: auto; }
        .title-banner { background: linear-gradient(135deg, #3d6b57 0%, #2d4a3e 100%); padding: 24px 40px; text-align: center; }
        .title-banner h1 { margin: 0; font-size: 22px; color: #ffffff; font-weight: 600; letter-spacing: 0.5px; }
        .content { padding: 40px; }
        .alert-box { background: linear-gradient(135deg, #f0f9f5 0%, #e6f4ed 100%); border-radius: 12px; padding: 24px; margin-bottom: 32px; border-left: 4px solid #558B73; }
        .alert-box p { margin: 0; font-size: 16px; color: #3d6b57; font-weight: 500; }
        .user-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .user-card-header { background: #f9fafb; padding: 16px 24px; border-bottom: 1px solid #e5e7eb; }
        .user-card-header h3 { margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .user-card-body { padding: 24px; }
        .info-row { display: flex; margin-bottom: 20px; }
        .info-row:last-child { margin-bottom: 0; }
        .info-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #558B73 0%, #3d6b57 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0; }
        .info-icon span { font-size: 20px; }
        .info-content { flex: 1; }
        .info-label { font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 600; }
        .info-value { font-size: 16px; color: #111827; font-weight: 500; }
        .info-value a { color: #558B73; text-decoration: none; }
        .info-value a:hover { text-decoration: underline; }
        .cta-section { text-align: center; margin-top: 32px; }
        .cta { display: inline-block; background: linear-gradient(135deg, #558B73 0%, #3d6b57 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(85,139,115,0.35); }
        .footer { background: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; font-size: 13px; color: #9ca3af; }
        .footer a { color: #558B73; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="AgentAssets" />
          </div>
          <div class="title-banner">
            <h1>🎉 New User Signup!</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <p>A new user has just signed up for AgentAssets!</p>
            </div>
            
            <div class="user-card">
              <div class="user-card-header">
                <h3>User Details</h3>
              </div>
              <div class="user-card-body">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 44px; height: 44px; background: linear-gradient(135deg, #558B73 0%, #3d6b57 100%); border-radius: 10px; text-align: center; vertical-align: middle;">
                            <span style="font-size: 20px;">👤</span>
                          </td>
                          <td style="padding-left: 16px;">
                            <div style="font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 600;">Name</div>
                            <div style="font-size: 18px; color: #111827; font-weight: 600;">${safeUserName}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 44px; height: 44px; background: linear-gradient(135deg, #558B73 0%, #3d6b57 100%); border-radius: 10px; text-align: center; vertical-align: middle;">
                            <span style="font-size: 20px;">✉️</span>
                          </td>
                          <td style="padding-left: 16px;">
                            <div style="font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 600;">Email</div>
                            <div style="font-size: 16px; color: #111827; font-weight: 500;">
                              <a href="mailto:${safeUserEmail}" style="color: #558B73; text-decoration: none;">${safeUserEmail}</a>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 44px; height: 44px; background: linear-gradient(135deg, #558B73 0%, #3d6b57 100%); border-radius: 10px; text-align: center; vertical-align: middle;">
                            <span style="font-size: 20px;">🕐</span>
                          </td>
                          <td style="padding-left: 16px;">
                            <div style="font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 600;">Signed Up</div>
                            <div style="font-size: 16px; color: #111827; font-weight: 500;">${formattedDate}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            
            <div class="cta-section">
              <a href="https://agentassets.com/admin" class="cta" style="color: white;">View in Admin Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>This notification was sent by AgentAssets</p>
            <p style="margin-top: 8px;">You received this because a new user signed up on the platform.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
New User Signup

Name: ${userName}
Email: ${userEmail}
Signed Up: ${formattedDate}

View in Admin Dashboard: https://agentassets.com/admin

---
AgentAssets - Beautiful Property Websites for Real Estate Professionals
  `.trim();

  await transporter.sendMail({
    from: `"AgentAssets" <${process.env.SMTP_FROM || "no-reply@agentassets.com"}>`,
    to: adminEmail,
    subject: `New User Signup: ${userName}`,
    text: textContent,
    html: htmlContent,
  });
  console.log(`New user notification email sent to ${adminEmail} for user ${userEmail}`);
}
