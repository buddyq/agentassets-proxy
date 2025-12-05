import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature, uuid);
  }

  static async handleCheckoutComplete(session: any): Promise<void> {
    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits || '0', 10);
    
    if (!userId || !credits) {
      console.error('Missing userId or credits in checkout session metadata');
      return;
    }

    const user = await storage.getUser(userId);
    if (!user) {
      console.error(`User ${userId} not found for credit purchase`);
      return;
    }

    await storage.updateUserCredits(userId, user.credits + credits);

    console.log(`Added ${credits} credits to user ${userId}. New balance: ${user.credits + credits}`);
  }
}
