import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createCheckoutSession } from '@/services/stripe-service';
import { getActiveTimer } from '@/services/timer-service';

// POST /api/payments/checkout - Create a checkout session for the chicken out payment
export async function POST(request: NextRequest) {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.twitterHandle) {
      return NextResponse.json({ success: false, error: 'Not authenticated with Twitter' }, { status: 401 });
    }
    
    // Create a mock timer data object with just the username
    // This avoids the need to make another API call that might fail due to auth issues
    const mockTimerData = {
      username: session.user.twitterHandle
    };
    
    // Create a checkout session
    const checkoutResponse = await createCheckoutSession(mockTimerData);
    
    if (!checkoutResponse.success) {
      return NextResponse.json(
        { success: false, error: checkoutResponse.error }, 
        { status: checkoutResponse.status || 500 }
      );
    }
    
    return NextResponse.json({ success: true, data: checkoutResponse.data });
  } catch (error) {
    console.error('Exception creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
