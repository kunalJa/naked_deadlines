import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with server-side environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/payments/status - Check if a payment was successful
export async function GET() {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.twitterHandle) {
      return NextResponse.json({ success: false, error: 'Not authenticated with Twitter' }, { status: 401 });
    }
    
    // Check if there's a successful payment record for this user
    const { data, error } = await supabase
      .from('payment_status')
      .select('*')
      .eq('username', session.user.twitterHandle)
      .eq('payment_successful', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      // If no record is found, it's not an error for our purposes
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: true, data: null });
      }
      
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Exception checking payment status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/payments/status - Clear payment status after processing
export async function DELETE() {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.twitterHandle) {
      return NextResponse.json({ success: false, error: 'Not authenticated with Twitter' }, { status: 401 });
    }
    
    // Delete the payment status record for this user
    const { error } = await supabase
      .from('payment_status')
      .delete()
      .eq('username', session.user.twitterHandle);
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Exception clearing payment status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
