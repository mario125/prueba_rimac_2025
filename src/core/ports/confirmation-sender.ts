export interface ConfirmationSender {
    
    send(confirmation: {
      appointmentId: string;
      status: 'completed' | 'failed';
      processedAt: string;
      
    }): Promise<void>;
  }