import { TimerData } from '@/types/timer';

// Updated interfaces to include status code
export interface ServiceResponse {
  success: boolean;
  error?: string;
  status?: number; // HTTP status code
}

export interface TimerResponse extends ServiceResponse {
  data?: TimerData;
}

interface EmailResponse extends ServiceResponse {
  messageId?: string;
}

/**
 * Send a confirmation email to a friend after creating a timer
 */
export async function sendConfirmationEmail(timerData: TimerData): Promise<EmailResponse> {
  try {
    // Call the API route to send the confirmation email
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timerData }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error sending confirmation email:', result.error);
      return { 
        success: false, 
        error: result.error, 
        status: response.status // Include the HTTP status code
      };
    }

    return { 
      success: true, 
      messageId: result.messageId,
      status: response.status 
    };
  } catch (error) {
    console.error('Exception sending confirmation email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

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
      // console.error('Error saving timer:', result.error);
      return { 
        success: false, 
        error: result.error,
        status: response.status // Include the HTTP status code
      };
    }

    return { 
      success: true, 
      data: result.data,
      status: response.status 
    };
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

    if (!response.ok) {
      // If it's a 404, it means there's no active timer
      if (response.status === 404) {
        console.log('getActiveTimer: No active timer found');
        return { 
          success: true, 
          data: undefined,
          status: 200 // No timer found is not an error for our purposes
        };
      }
      // console.error('Error getting timer:', response.status);
      const errorText = await response.text();
      return { 
        success: false, 
        error: errorText || `HTTP error ${response.status}`,
        status: response.status 
      };
    }

    const result = await response.json();
    console.log('getActiveTimer: Timer data received:', result.data);
    return { 
      success: true, 
      data: result.data,
      status: response.status 
    };
  } catch (error) {
    console.error('Exception getting timer:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 500 // Default to internal server error for exceptions
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

    if (!response.ok) {
      console.error('Error deleting timer:', response.status);
      const errorText = await response.text();
      return { 
        success: false, 
        error: errorText || `HTTP error ${response.status}`,
        status: response.status
      };
    }

    return { 
      success: true,
      status: response.status
    };
  } catch (error) {
    console.error('Exception deleting timer:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 500 // Default to internal server error for exceptions
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
