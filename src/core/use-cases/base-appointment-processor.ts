import { AppointmentRepository } from '../ports/appointment-repository';
import { ConfirmationSender } from '../ports/confirmation-sender';


export abstract class BaseAppointmentProcessor {
 
  constructor(
    protected readonly repository: AppointmentRepository,
    protected readonly confirmationSender: ConfirmationSender
  ) {}

 
  abstract process(params: {
    appointmentId: string;
    insuredId: string;
    scheduleId: number;
    countryISO: 'PE' | 'CL';
  }): Promise<void>;


  protected async sendConfirmation(appointmentId: string): Promise<void> {
    await this.confirmationSender.send({
      appointmentId,
      status: 'completed',
      processedAt: new Date().toISOString(),
    });
  }
}