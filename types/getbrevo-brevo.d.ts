declare module '@getbrevo/brevo' {
  import { IncomingMessage } from 'http';

  export default {
    TransactionalEmailsApi: typeof TransactionalEmailsApi,
    SendSmtpEmail: typeof SendSmtpEmail
  };

  export class TransactionalEmailsApi {
    constructor();
    
    // Make authentications public for TypeScript
    authentications: {
      apiKey: {
        apiKey: string;
      };
    };

    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<{
      response: IncomingMessage;
      body: CreateSmtpEmail;
    }>;
  }

  export class SendSmtpEmail {
    sender: {
      name: string;
      email: string;
    };
    to: Array<{
      email: string;
      name?: string;
    }>;
    subject: string;
    htmlContent: string;
    textContent: string;
  }

  export interface CreateSmtpEmail {
    messageId?: string;
  }
}
