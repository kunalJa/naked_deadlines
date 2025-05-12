import Stripe from 'stripe';
import { STRIPE_API_KEY, CHICKEN_OUT_PRICE_CENTS, CURRENCY } from '@/config/stripe';

// Initialize Stripe client
const stripe = new Stripe(STRIPE_API_KEY, {
  apiVersion: '2023-10-16',
});

export interface StripeResponse {
  success: boolean;
  error?: string;
  status?: number;
  data?: any;
}

/**
 * Create a Stripe checkout session for the chicken out payment
 */
export async function createCheckoutSession(timerData: any): Promise<StripeResponse> {
  try {
    // Ensure we have the username
    if (!timerData?.username) {
      return {
        success: false,
        error: 'Username is required to create a checkout session',
        status: 400,
      };
    }
    
    // Get the base URL from environment or use a default for local development
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: 'Chicken Out Fee',
              description: 'Fee for chickening out of your goal',
            },
            unit_amount: CHICKEN_OUT_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/timer`,
      metadata: {
        username: timerData.username, // This is critical for tracking the payment
      },
    });

    return {
      success: true,
      data: { sessionId: session.id, url: session.url },
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 500,
    };
  }
}

/**
 * Verify a Stripe checkout session
 */
export async function verifyCheckoutSession(sessionId: string): Promise<StripeResponse> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return {
        success: false,
        error: 'Payment not completed',
        status: 400,
      };
    }

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 500,
    };
  }
}
