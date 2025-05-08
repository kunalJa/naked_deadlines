import { TimerData, TimerResponse } from '@/types/timer';

/**
 * Save a new timer using the API route
 */
export async function saveTimer(timerData: TimerData): Promise<TimerResponse> {
  try {
    // Call the API route to save the timer
    const response = await fetch('/api/timer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timerData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error saving timer:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Exception saving timer:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get an active timer for the current user
 */
export async function getActiveTimer(): Promise<TimerResponse> {
  try {
    console.log('getActiveTimer: Fetching timer from API');
    // Call the API route to get the timer
    const response = await fetch('/api/timer', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('getActiveTimer: API response status:', response.status);

    const result = await response.json();
    console.log('getActiveTimer: API response data:', result);

    if (!response.ok) {
      // If it's a 404, it means there's no active timer
      if (response.status === 404) {
        return { success: false, error: result.error || 'No active timer found' };
      }
      
      console.error('Error getting timer:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Exception getting timer:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Delete a timer for the current user
 */
export async function deleteTimer(): Promise<TimerResponse> {
  try {
    // Call the API route to delete the timer
    const response = await fetch('/api/timer', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Clean up a verified timer - delete from database and local storage
 */
export async function cleanupVerifiedTimer(imageKey: string): Promise<TimerResponse> {
  try {
    // First, delete the timer from Supabase
    const deleteResult = await deleteTimer();
    
    if (!deleteResult.success) {
      return deleteResult;
    }
    
    // Then, clean up local storage
    if (imageKey) {
      localStorage.removeItem(`${imageKey}_preview`);
      localStorage.removeItem(`${imageKey}_name`);
      localStorage.removeItem(`${imageKey}_type`);
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
