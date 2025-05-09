import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import { TimerData } from '@/types/timer';

const TIMERS_TABLE = 'timers';

// Initialize Supabase client with server-side environment variables
// These are not exposed to the client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get the current user from the session
async function getCurrentUser() {
  // Pass authOptions to getServerSession to ensure custom session properties are available
  const session = await getServerSession(authOptions);
  
  // Check for Twitter handle instead of name
  if (!session?.user?.twitterHandle) {
    throw new Error('Not authenticated with Twitter');
  }
  return session.user;
}

// GET /api/timer - Get the current user's timer
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    // Get the timer data from Supabase using Twitter handle
    const { data, error } = await supabase
      .from(TIMERS_TABLE)
      .select('*')
      .eq('username', user.twitterHandle)
      .single();

    if (error) {
      // If the error is 'No rows found', it means there's no active timer
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'No active timer found' }, { status: 404 });
      }
      
      console.error('Error getting timer:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Check if the timer is still active (deadline is in the future)
    const timerData = data as TimerData;
    return NextResponse.json({ success: true, data: timerData });
  } catch (error) {
    console.error('Exception getting timer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 401 });
  }
}

// POST /api/timer - Create or update a timer
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    // Validate the request body
    if (!body.imagekey || !body.goaldescription || !body.deadline || !body.friendemail) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    // Log the request body for debugging
    console.log('Timer data received:', body);
    
    // Add user and creation timestamp
    // Ensure user.twitterHandle is defined
    if (!user.twitterHandle) {
      return NextResponse.json({ success: false, error: 'Twitter handle is required' }, { status: 400 });
    }
    
    // Use the client-provided confirmationToken or generate one if not provided
    const confirmationToken = body.confirmationtoken || crypto.randomUUID();
    
    const timerData: TimerData = {
      username: user.twitterHandle, // Use Twitter handle instead of name
      imagekey: body.imagekey,
      goaldescription: body.goaldescription,
      deadline: body.deadline,
      friendemail: body.friendemail,
      createdat: body.createdat || new Date().toISOString(), // Use client-provided value if available
      confirmationtoken: confirmationToken,
      isverified: body.isverified !== undefined ? body.isverified : (body.isVerified !== undefined ? body.isVerified : false)
    };

    // Insert the timer data into Supabase
    const { error } = await supabase
      .from(TIMERS_TABLE)
      .upsert(timerData)
      .eq('username', user.twitterHandle);

    if (error) {
      console.error('Error saving timer:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: timerData });
  } catch (error) {
    console.error('Exception saving timer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 401 });
  }
}

// DELETE /api/timer - Delete a timer
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    
    const { error } = await supabase
      .from(TIMERS_TABLE)
      .delete()
      .eq('username', user.twitterHandle);

    if (error) {
      console.error('Error deleting timer:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Exception deleting timer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 401 });
  }
}
