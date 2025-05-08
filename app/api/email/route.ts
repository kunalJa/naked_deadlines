import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { sendConfirmationEmail } from '@/services/email-service';
import { TimerData } from '@/types/timer';

// Helper function to get the current user from the session
async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  // Check for Twitter handle instead of name
  if (!session?.user?.twitterHandle) {
    throw new Error('Not authenticated with Twitter');
  }
  return session.user;
}

// POST /api/email - Send a confirmation email to a friend
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    // Validate the request body
    if (!body.timerData || !body.timerData.confirmationtoken || !body.timerData.friendemail) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    // Send the confirmation email
    // Ensure twitterHandle is a string, not undefined
    const twitterHandle = user.twitterHandle || '';
    const result = await sendConfirmationEmail(body.timerData as TimerData, twitterHandle);
    
    if (!result.success) {
      console.error('Error sending confirmation email:', result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Exception sending confirmation email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 401 });
  }
}
