import cron from 'node-cron';
import { storage } from './storage';
import { sendMonthlyAnalyticsEmail } from './email';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export async function sendAnalyticsEmailToUser(userId: string): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    if (!user || !user.email) {
      console.log(`Skipping analytics email for user ${userId}: no email address`);
      return false;
    }

    const sites = await storage.getSitesByUser(userId);
    
    const now = new Date();
    const monthName = MONTH_NAMES[now.getMonth()];
    const year = now.getFullYear();

    const siteAnalytics = sites.map(site => ({
      title: site.title || '',
      address: site.address || '',
      slug: site.subdomain || '',
      customDomain: site.customDomain || null,
      views: site.stats?.views || 0,
      uniqueVisitors: site.stats?.uniqueVisitors || 0,
      leads: site.stats?.leads || 0,
      status: site.status || 'draft'
    }));

    await sendMonthlyAnalyticsEmail({
      recipientEmail: user.email,
      recipientName: user.name || user.username || '',
      sites: siteAnalytics,
      monthName,
      year
    });

    await storage.markAnalyticsEmailSent(userId);
    return true;
  } catch (error) {
    console.error(`Failed to send analytics email to user ${userId}:`, error);
    return false;
  }
}

export async function sendAllMonthlyAnalyticsEmails(): Promise<{ sent: number; failed: number; skipped: number }> {
  console.log('Starting monthly analytics email job...');
  
  const users = await storage.getUsersForAnalyticsEmail();
  console.log(`Found ${users.length} users eligible for analytics emails`);

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const user of users) {
    if (!user.email) {
      skipped++;
      continue;
    }

    const success = await sendAnalyticsEmailToUser(user.id);
    if (success) {
      sent++;
    } else {
      failed++;
    }

    // Small delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`Monthly analytics email job completed: ${sent} sent, ${failed} failed, ${skipped} skipped`);
  return { sent, failed, skipped };
}

export function initScheduler() {
  // Run on the 1st of every month at 9:00 AM
  cron.schedule('0 9 1 * *', async () => {
    console.log('Running scheduled monthly analytics emails...');
    try {
      await sendAllMonthlyAnalyticsEmails();
    } catch (error) {
      console.error('Error running monthly analytics email job:', error);
    }
  });

  console.log('Scheduler initialized: Monthly analytics emails scheduled for 1st of each month at 9:00 AM');
}
