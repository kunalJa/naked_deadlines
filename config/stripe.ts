// Stripe configuration
export const STRIPE_API_KEY = process.env.STRIPE_SECRET_KEY || '';
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Payment configuration
export const CHICKEN_OUT_PRICE_CENTS = 99; // 99 cents
export const CURRENCY = 'usd';
