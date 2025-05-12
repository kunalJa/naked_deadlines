import { NextRequest, NextResponse } from 'next/server';

// GET /api/payments/success - Handle successful payments
export async function GET(request: NextRequest) {
  try {
    // Get the session_id from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');
    
    // Redirect back to the timer page with a payment_success parameter
    // This will trigger the chicken out action in the timer-display component
    return NextResponse.redirect(new URL('/timer?payment_success=true', request.url));
  } catch (error) {
    console.error('Exception in payment success handler:', error);
    return NextResponse.redirect(new URL('/timer', request.url));
  }
}
