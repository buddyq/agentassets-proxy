import { getStripeSync, getUncachableStripeClient, getUserWebhookSecret } from './stripeClient';
import { storage } from './storage';
import Stripe from 'stripe';

export class WebhookHandlers {
  // Process webhook with managed UUID (from stripe-replit-sync)
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

    const stripe = await getUncachableStripeClient();
    const webhookSecret = await sync.getManagedWebhookSecret(uuid);
    
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error('Failed to construct event for custom handling:', err.message);
      return;
    }

    await WebhookHandlers.handleEvent(event);
  }

  // Process webhook with user-provided secret
  static async processWebhookWithUserSecret(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const webhookSecret = getUserWebhookSecret();
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    }

    const stripe = await getUncachableStripeClient();
    
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error('Failed to verify webhook signature:', err.message);
      throw err;
    }

    await WebhookHandlers.handleEvent(event);
  }

  // Common event handler
  private static async handleEvent(event: Stripe.Event): Promise<void> {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await WebhookHandlers.handleCheckoutComplete(session);
    }
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
