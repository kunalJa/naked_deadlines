import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TIMERS_TABLE = 'timers';

// Initialize Supabase client with server-side environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/confirm?token=xyz
 * Gets timer data using the confirmation token
 */
export async function GET(request: NextRequest) {
  try {
    // Get the token from the query string
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing confirmation token' }, { status: 400 });
    }

    // Find the timer with this token
    const { data, error } = await supabase
      .from(TIMERS_TABLE)
      .select('*')
      .eq('confirmationtoken', token)
      .single();

    if (error) {
      console.error('Error finding timer by token:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired confirmation token' 
      }, { status: 404 });
    }

    // Return the timer data
    return NextResponse.json({ 
      success: true, 
      data: data
    });
  } catch (error) {
    console.error('Exception in confirmation process:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

/**
 * PUT /api/confirm?token=xyz
 * Verifies a timer using the confirmation token
 */
export async function PUT(request: NextRequest) {
  try {
    // Get the token from the query string
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing confirmation token' }, { status: 400 });
    }

    // Find the timer with this token
    const { data, error } = await supabase
      .from(TIMERS_TABLE)
      .select('*')
      .eq('confirmationtoken', token)
      .single();

    if (error) {
      console.error('Error finding timer by token:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired confirmation token' 
      }, { status: 404 });
    }

    // Update the timer to mark it as verified
    const { error: updateError } = await supabase
      .from(TIMERS_TABLE)
      .update({ isverified: true })
      .eq('confirmationtoken', token);

    if (updateError) {
      console.error('Error updating timer verification status:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to verify timer' 
      }, { status: 500 });
    }

    // Return success
    return NextResponse.json({ 
      success: true, 
      message: 'Timer verified successfully' 
    });
  } catch (error) {
    console.error('Exception in confirmation process:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
