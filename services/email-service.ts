import { TimerData } from '@/types/timer';

import { ServiceResponse } from './timer-service';

interface EmailResponse extends ServiceResponse {
  messageId?: string;
}

/**
 * Send a confirmation email to a friend when a timer is created
 */
export async function sendConfirmationEmail(timerData: TimerData, creatorTwitterHandle: string): Promise<EmailResponse> {
  try {
    // Import the Brevo SDK using require (CommonJS) to avoid TypeScript issues
    // @ts-ignore
    const brevo = require('@getbrevo/brevo');
    
    // Initialize the Brevo API client
    const apiInstance = new brevo.TransactionalEmailsApi();
    
    // Set up API key authentication
    // @ts-ignore
    const apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY || '';
    
    if (!process.env.BREVO_API_KEY) {
      throw new Error('Brevo API key is missing');
    }

    // Create the confirmation URL using the token
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/confirm/${timerData.confirmationtoken}`;
    
    // Format the deadline in a human-readable format
    const deadline = new Date(timerData.deadline).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York',
      timeZoneName: 'short'
    });

    // Create the email object
    // @ts-ignore
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    // Set sender information
    sendSmtpEmail.sender = {
      name: 'Naked Deadlines',
      email: 'noreply@mail.nakeddeadlines.com'
    };
    
    // Set recipient
    sendSmtpEmail.to = [{
      email: timerData.friendemail
    }];
    
    // Set email subject
    sendSmtpEmail.subject = `${creatorTwitterHandle} needs your help with their goal!`;
    
    // Set email content
    sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f8ff; }
    .container { 
      background: linear-gradient(to bottom, #e6f7ff, #cce5ff); 
      border-radius: 15px; 
      padding: 25px; 
      border: 2px solid #a3d0ff; 
      box-shadow: 0 4px 15px rgba(0, 120, 212, 0.1);
      position: relative;
      overflow: hidden;
    }
    .header { 
      background: linear-gradient(to right, #4facfe, #00f2fe); 
      color: white; 
      padding: 15px; 
      border-radius: 10px; 
      text-align: center; 
      margin-bottom: 25px; 
      box-shadow: 0 3px 10px rgba(0, 120, 212, 0.2);
      position: relative;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    }

    .goal-box {
      font-size: 18px; 
      background-color: #e1f5fe; 
      padding: 15px; 
      border-radius: 10px; 
      border-left: 5px solid #4facfe;
      margin: 15px 0;
      box-shadow: 0 2px 8px rgba(0, 120, 212, 0.1);
    }
    .button { 
      display: inline-block; 
      background: linear-gradient(to right, #4facfe, #00f2fe); 
      color: white; 
      text-decoration: none; 
      padding: 12px 25px; 
      border-radius: 30px; 
      margin: 20px 0; 
      font-weight: bold;
      box-shadow: 0 4px 10px rgba(0, 120, 212, 0.3);
      transition: all 0.3s ease;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0, 120, 212, 0.4);
    }
    .link-box {
      word-break: break-all; 
      background-color: #e1f5fe; 
      padding: 12px; 
      border-radius: 8px; 
      font-size: 12px;
      border: 1px dashed #4facfe;
    }
    .footer { 
      font-size: 12px; 
      color: #666; 
      margin-top: 30px; 
      text-align: center;
      padding-top: 15px;
      border-top: 1px solid #a3d0ff;
    }
    /* Duck decoration */
    .duck {
      position: absolute;
      bottom: 15px;
      right: 15px;
      font-size: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛁 Naked Deadlines 🛁</h1>
    </div>
    
    <p>Hi there! 👋</p>
    
    <p><strong>@${creatorTwitterHandle}</strong> has set a goal to complete:</p>
    
    <div class="goal-box">
      <strong>"${timerData.goaldescription}"</strong>
    </div>
    
    <p>by <strong>${deadline}</strong>.</p>
    
    <p>If they don't complete it in time, an embarrassing photo will be tweeted from their account! 😱</p>
    
    <p>You've been chosen as their accountability partner. When they complete their goal, please click the button below to verify it:</p>
    
    <div style="text-align: center;">
      <a href="${confirmationUrl}" class="button">🎯 Verify Goal Completion</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    
    <div class="link-box">
      ${confirmationUrl}
    </div>
    
    <p>Thank you for helping them stay accountable!</p>
    
    <div class="footer">
      <p>- The Naked Deadlines Team</p>
    </div>
  </div>
</body>
</html>
    `;
    
    sendSmtpEmail.textContent = `
Hi there,

${creatorTwitterHandle} has set a goal to complete "${timerData.goaldescription}" by ${deadline}.

If they don't complete it in time, an embarrassing photo will be tweeted from their account! 😱

You've been chosen as their accountability partner. When they complete their goal, please click the link below to verify it:

${confirmationUrl}

Thank you for helping them stay accountable!

- The Naked Deadlines Team
    `;

    // Send the email
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    return {
      success: true,
      status: 200, // Default to OK for successful responses
      // The response structure might vary, so we handle it safely
      messageId: (data?.body?.messageId || data?.messageId || 'Email sent successfully').toString()
    };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return {
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 500 // Default to internal server error for exceptions
    };
  }
}
