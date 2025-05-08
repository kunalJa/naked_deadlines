import { TimerData } from '@/types/timer';

interface EmailResponse {
  success: boolean;
  error?: string;
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
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background-color: #f9f9f9; border-radius: 10px; padding: 20px; border: 1px solid #ddd; }
    .header { background-color: #6366f1; color: white; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px; }
    .button { display: inline-block; background-color: #6366f1; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }
    .footer { font-size: 12px; color: #666; margin-top: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Naked Deadlines</h1>
    </div>
    <p>Hi there,</p>
    <p><strong>@${creatorTwitterHandle}</strong> has set a goal to complete:</p>
    <p style="font-size: 18px; background-color: #e9ecef; padding: 10px; border-radius: 5px;"><strong>"${timerData.goaldescription}"</strong></p>
    <p>by <strong>${deadline}</strong>.</p>
    <p>If they don't complete it in time, an embarrassing photo will be tweeted from their account! 😱</p>
    <p>You've been chosen as their accountability partner. When they complete their goal, please click the button below to verify it:</p>
    <div style="text-align: center;">
      <a href="${confirmationUrl}" class="button">Verify Goal Completion</a>
    </div>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 5px; font-size: 12px;">${confirmationUrl}</p>
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
      // The response structure might vary, so we handle it safely
      messageId: (data?.body?.messageId || data?.messageId || 'Email sent successfully').toString()
    };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
